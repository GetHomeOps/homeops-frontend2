import { useEffect, useRef, useCallback, useState } from "react";

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-places-script";
const API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || "";

let scriptLoadPromise = null;

function loadGoogleMapsScript() {
  if (scriptLoadPromise) return scriptLoadPromise;
  if (window.google?.maps?.places) return Promise.resolve();

  scriptLoadPromise = new Promise((resolve, reject) => {
    if (document.getElementById(GOOGLE_MAPS_SCRIPT_ID)) {
      const check = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

function parseAddressComponents(place) {
  const result = {
    streetNumber: "",
    route: "",
    city: "",
    state: "",
    zip: "",
    county: "",
    country: "",
    formattedAddress: place.formatted_address || "",
  };

  for (const component of place.address_components || []) {
    const types = component.types;
    if (types.includes("street_number")) {
      result.streetNumber = component.long_name;
    } else if (types.includes("route")) {
      result.route = component.long_name;
    } else if (types.includes("locality")) {
      result.city = component.long_name;
    } else if (types.includes("administrative_area_level_2")) {
      result.county = component.long_name.replace(/ County$/i, "");
    } else if (types.includes("administrative_area_level_1")) {
      result.state = component.short_name;
    } else if (types.includes("postal_code")) {
      result.zip = component.long_name;
    } else if (types.includes("country")) {
      result.country = component.short_name;
    } else if (types.includes("subpremise")) {
      result.subpremise = component.long_name;
    }
  }

  const addressLine1 = [result.streetNumber, result.route]
    .filter(Boolean)
    .join(" ");

  return {
    addressLine1,
    addressLine2: result.subpremise || "",
    city: result.city,
    state: result.state,
    zip: result.zip,
    county: result.county,
    formattedAddress: result.formattedAddress,
  };
}

/**
 * Hook that attaches Google Places Autocomplete to an input via a callback ref.
 *
 * Uses a two-phase approach: (1) load the Google Maps script, then (2) attach
 * Autocomplete once both the script AND the input DOM element are available.
 * This avoids the stale-ref problem where conditionally-rendered inputs
 * (e.g. inside modals) are not in the DOM when the script first loads.
 *
 * @param {Object} options
 * @param {Function} options.onPlaceSelected - callback with parsed address fields
 * @param {string[]} options.types - autocomplete types (default: ["address"])
 * @param {Object}  options.componentRestrictions - country codes (default: {country:"us"})
 * @returns {{ inputRef: (node: HTMLInputElement|null) => void, isLoaded: boolean, error: string|null }}
 */
export default function useGooglePlacesAutocomplete({
  onPlaceSelected,
  types = ["address"],
  componentRestrictions = { country: "us" },
} = {}) {
  const autocompleteRef = useRef(null);
  const callbackRef = useRef(onPlaceSelected);
  const [scriptReady, setScriptReady] = useState(
    () => !!window.google?.maps?.places,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [inputElement, setInputElement] = useState(null);

  callbackRef.current = onPlaceSelected;

  const inputRef = useCallback((node) => {
    setInputElement(node);
  }, []);

  useEffect(() => {
    if (!API_KEY) {
      setError("Google Places API key not configured");
      return;
    }

    let cancelled = false;

    loadGoogleMapsScript()
      .then(() => {
        if (!cancelled) setScriptReady(true);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!scriptReady || !inputElement) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputElement,
      {
        types,
        componentRestrictions,
        fields: ["address_components", "formatted_address", "geometry"],
      },
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;
      const parsed = parseAddressComponents(place);
      callbackRef.current?.(parsed);
    });

    autocompleteRef.current = autocomplete;
    setIsLoaded(true);

    return () => {
      window.google?.maps?.event?.clearInstanceListeners(autocomplete);
      autocompleteRef.current = null;
      setIsLoaded(false);
    };
  }, [scriptReady, inputElement]);

  return { inputRef, isLoaded, error };
}
