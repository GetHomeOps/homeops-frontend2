import React, {
  useReducer,
  useRef,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {useNavigate, useLocation, useParams} from "react-router-dom";
import PropertyContext from "../../context/PropertyContext";
import UserContext from "../../context/UserContext";
import ContactContext from "../../context/ContactContext";
import {useAuth} from "../../context/AuthContext";
import AppApi from "../../api/api";
import SystemsTab from "./SystemsTab";
import MaintenanceTab from "./MaintenanceTab";
import IdentityTab from "./IdentityTab";
import DocumentsTab from "./DocumentsTab";
import CircularProgress from "../../partials/propertyFeatures/CircularProgress";
import ScoreCard from "./ScoreCard";
import HomeOpsTeam from "./partials/HomeOpsTeam";
import SystemsSetupModal from "./partials/SystemsSetupModal";
import SharePropertyModal from "./partials/SharePropertyModal";
import PropertyUnauthorized from "./PropertyUnauthorized";
import PropertyNotFound from "./PropertyNotFound";
import {ApiError} from "../../api/api";

/** True if the API error indicates the property does not exist (404 or 403 "Property not found"). */
function isPropertyNotFoundError(err) {
  if (!(err instanceof ApiError)) return false;
  if (err.status === 404) return true;
  if (err.status === 403) {
    const msg = (
      err.message ||
      (err.messages && err.messages[0]) ||
      ""
    ).toLowerCase();
    return msg.includes("not found");
  }
  return false;
}
import {
  preparePropertyValues,
  prepareIdentityForUpdate,
  prepareTeamForProperty,
  mapPropertyFromBackend,
} from "./helpers/preparePropertyValues";
import {mapSystemsFromBackend} from "./helpers/mapSystemsFromBackend";
import {prepareSystemsForApi} from "./helpers/prepareSystemsForApi";
import {
  splitFormDataByTabs,
  mergeFormDataFromTabs,
  INITIAL_IDENTITY,
  INITIAL_SYSTEMS,
  SYSTEM_FIELD_NAMES,
} from "./helpers/formDataByTabs";
import {buildPropertyPayloadFromRefresh} from "./helpers/buildPropertyPayloadFromRefresh";
import {formSystemsToArray} from "./helpers/formSystemsToArray";
import {computeHpsScore} from "./helpers/computeHpsScore";
import {
  mapMaintenanceRecordsFromBackend,
  prepareMaintenanceRecordsForApi,
  computeMaintenanceSyncPlan,
  isNewMaintenanceRecord,
} from "./helpers/maintenanceRecordMapping";
import {STANDARD_CUSTOM_SYSTEM_FIELDS} from "./constants/propertySystems";
import Banner from "../../partials/containers/Banner";
import {useAutoCloseBanner} from "../../hooks/useAutoCloseBanner";
import {
  Bed,
  Bath,
  Ruler,
  Calendar,
  FileText,
  Settings,
  Wrench,
  Image as ImageIcon,
  ClipboardList,
  Home,
  MapPin,
  Building,
  Zap,
  Droplet,
  Shield,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  ChevronUp,
  FileBarChart,
  Share2,
  Loader2,
} from "lucide-react";
import useImageUpload from "../../hooks/useImageUpload";
import usePresignedPreview from "../../hooks/usePresignedPreview";
import useGooglePlacesAutocomplete from "../../hooks/useGooglePlacesAutocomplete";
import ImageUploadField from "../../components/ImageUploadField";
import {useTranslation} from "react-i18next";
import Transition from "../../utils/Transition";

const initialFormData = {
  identity: {...INITIAL_IDENTITY},
  systems: {...INITIAL_SYSTEMS},
  maintenanceRecords: [],
};

const initialState = {
  formData: initialFormData,
  errors: {},
  isSubmitting: false,
  property: null,
  /** Systems from backend - kept separate from identity/formData */
  systems: [],
  /** Maintenance records as last saved to backend; used for tree date display only */
  savedMaintenanceRecords: [],
  activeTab: "identity",
  isNew: true,
  formDataChanged: false,
  isInitialLoad: true,
  bannerOpen: false,
  bannerType: "success",
  bannerMessage: "",
  /** Set when GET property returns 403 (user not on HomeOps team) */
  propertyAccessDenied: false,
  /** Set when GET property returns 404 or 403 "Property not found" */
  propertyNotFound: false,
};

/** Build default team member for the current user (creator) so new property always has at least one. */
function getCreatorAsTeamMember(currentUser) {
  if (!currentUser?.id) return null;
  const r = (currentUser.role ?? "").toLowerCase();
  const displayRole =
    r === "super_admin"
      ? "Admin"
      : r === "agent"
        ? "Agent"
        : r === "homeowner"
          ? "Homeowner"
          : "Agent";
  return {
    id: currentUser.id,
    name: currentUser.name ?? "User",
    role: displayRole,
    image: currentUser.image ?? currentUser.avatar,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_FORM_DATA": {
      const p = action.payload ?? {};
      const hasTabbed =
        "identity" in p || "systems" in p || "maintenanceRecords" in p;
      if (hasTabbed) {
        return {
          ...state,
          formData: {
            identity: {...state.formData.identity, ...(p.identity ?? {})},
            systems: {...state.formData.systems, ...(p.systems ?? {})},
            maintenanceRecords:
              p.maintenanceRecords ?? state.formData.maintenanceRecords ?? [],
          },
          formDataChanged: !state.isInitialLoad,
        };
      }
      const split = splitFormDataByTabs(p);
      return {
        ...state,
        formData: {
          identity: {...state.formData.identity, ...split.identity},
          systems: {...state.formData.systems, ...split.systems},
          maintenanceRecords:
            split.maintenanceRecords.length > 0
              ? split.maintenanceRecords
              : (state.formData.maintenanceRecords ?? []),
        },
        formDataChanged: !state.isInitialLoad,
      };
    }
    case "SET_IDENTITY_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          identity: {...state.formData.identity, ...action.payload},
        },
        formDataChanged: !state.isInitialLoad,
      };
    case "SET_SYSTEMS_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          systems: {...state.formData.systems, ...action.payload},
        },
        formDataChanged: !state.isInitialLoad,
      };
    case "SET_MAINTENANCE_FORM_DATA":
      return {
        ...state,
        formData: {
          ...state.formData,
          maintenanceRecords: action.payload ?? [],
        },
        formDataChanged: true,
        isInitialLoad: false,
      };
    case "SET_ERRORS":
      return {...state, errors: action.payload};
    case "SET_VALIDATION_FAILED":
      return {
        ...state,
        errors: action.payload.errors,
        activeTab: "identity",
      };
    case "SET_SUBMITTING":
      return {...state, isSubmitting: action.payload};
    case "SET_PROPERTY": {
      const payload = action.payload;
      const nextFormData = payload
        ? payload.identity && payload.systems
          ? {...payload}
          : splitFormDataByTabs(payload)
        : {...initialFormData};
      const savedRecords = payload ? (payload.maintenanceRecords ?? []) : [];
      return {
        ...state,
        property: payload,
        isNew: !payload,
        formData: nextFormData,
        savedMaintenanceRecords: Array.isArray(savedRecords)
          ? savedRecords
          : [],
        formDataChanged: false,
        isInitialLoad: true,
        errors: {},
        propertyAccessDenied: false,
        propertyNotFound: false,
      };
    }
    case "REFRESH_PROPERTY_AFTER_SAVE": {
      const payload = action.payload;
      const nextFormData = payload
        ? payload.identity && payload.systems
          ? {...payload}
          : splitFormDataByTabs(payload)
        : {...initialFormData};
      const savedRecords = payload ? (payload.maintenanceRecords ?? []) : [];
      return {
        ...state,
        property: payload,
        formData: nextFormData,
        savedMaintenanceRecords: Array.isArray(savedRecords)
          ? savedRecords
          : [],
        formDataChanged: false,
        isInitialLoad: false,
        errors: {},
      };
    }
    case "SET_PROPERTY_ACCESS_DENIED":
      return {...state, propertyAccessDenied: action.payload};
    case "SET_PROPERTY_NOT_FOUND":
      return {...state, propertyNotFound: action.payload};
    case "SET_SYSTEMS":
      return {...state, systems: action.payload ?? []};
    case "SET_ACTIVE_TAB":
      return {...state, activeTab: action.payload};
    case "SET_FORM_CHANGED":
      return {
        ...state,
        formDataChanged: action.payload,
        isInitialLoad: false,
      };
    case "SET_BANNER":
      return {
        ...state,
        bannerOpen: action.payload.open,
        bannerType: action.payload.type,
        bannerMessage: action.payload.message,
      };
    default:
      return state;
  }
}

const platformUsers = [];
const mockProperties = [];

const tabs = [
  {id: "identity", label: "Identity"},
  {id: "systems", label: "Systems"},
  {id: "maintenance", label: "Maintenance"},
  {id: "documents", label: "Documents"},
  {id: "media", label: "Media"},
];

const formatCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/* Property Form Container */
function PropertyFormContainer() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const location = useLocation();
  const {uid, accountUrl: accountUrlParam} = useParams();
  const {t} = useTranslation();
  const {
    currentAccount,
    createProperty,
    createSystemsForProperty,
    properties,
    maintenanceRecords,
    setMaintenanceRecords,
    getPropertyById,
    addUsersToProperty,
    getPropertyTeam,
    updateProperty,
    updateTeam,
    getSystemsByPropertyId,
    updateSystemsForProperty,
    getMaintenanceRecordsByPropertyId,
    createMaintenanceRecords,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
  } = useContext(PropertyContext);

  const {users} = useContext(UserContext);
  const {contacts} = useContext(ContactContext);
  const {currentUser} = useAuth();
  const accountUrl = accountUrlParam || currentAccount?.url || currentAccount?.name || "";
  const [homeopsTeam, setHomeopsTeam] = useState([]);
  const [systemsSetupModalOpen, setSystemsSetupModalOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [mainPhotoMenuOpen, setMainPhotoMenuOpen] = useState(false);
  const mainPhotoInputRef = useRef(null);
  const actionsTriggerRef = useRef(null);
  const actionsDropdownRef = useRef(null);
  const saveBarRef = useRef(null);
  const originalMaintenanceRecordIdsRef = useRef(new Set());

  const {
    uploadImage: uploadMainPhoto,
    imagePreviewUrl: mainPhotoPreviewUrl,
    uploadedImageUrl: mainPhotoUploadedUrl,
    imageUploading: mainPhotoUploading,
    imageUploadError: mainPhotoUploadError,
    setImageUploadError: setMainPhotoUploadError,
    clearPreview: clearMainPhotoPreview,
    clearUploadedUrl: clearMainPhotoUploadedUrl,
  } = useImageUpload({
    onSuccess: (key) => {
      dispatch({type: "SET_IDENTITY_FORM_DATA", payload: {mainPhoto: key}});
      if (state.isInitialLoad) {
        dispatch({type: "SET_FORM_CHANGED", payload: true});
      }
    },
  });

  const {
    url: mainPhotoPresignedUrl,
    fetchPreview: fetchMainPhotoPresigned,
    clearUrl: clearMainPhotoPresignedUrl,
    currentKey: mainPhotoPresignedKey,
  } = usePresignedPreview();

  /* Google Places Autocomplete for Identity tab address field */
  const handleIdentityPlaceSelected = useCallback((parsed) => {
    dispatch({
      type: "SET_IDENTITY_FORM_DATA",
      payload: {
        address: parsed.formattedAddress,
        addressLine1: parsed.addressLine1,
        addressLine2: parsed.addressLine2,
        city: parsed.city,
        state: parsed.state,
        zip: parsed.zip,
        county: parsed.county,
      },
    });
    dispatch({type: "SET_FORM_CHANGED", payload: true});
  }, []);

  const {
    inputRef: identityAddressRef,
    isLoaded: identityPlacesLoaded,
    error: identityPlacesError,
  } = useGooglePlacesAutocomplete({
    onPlaceSelected: handleIdentityPlaceSelected,
  });

  /* Fetch presigned URL when mainPhoto is an S3 key (not blob or http) */
  const mainPhotoKey =
    state.property?.identity?.mainPhoto ??
    state.formData?.identity?.mainPhoto ??
    "";
  const mainPhotoNeedsPresigned =
    mainPhotoKey &&
    !mainPhotoKey.startsWith("blob:") &&
    !mainPhotoKey.startsWith("http");
  useEffect(() => {
    if (mainPhotoNeedsPresigned) {
      fetchMainPhotoPresigned(mainPhotoKey);
    }
  }, [mainPhotoNeedsPresigned, mainPhotoKey, fetchMainPhotoPresigned]);

  // Report: stored PDF report (TODO: integrate with backend)
  const hasReport = Boolean(state.property?.reportUrl);

  /* Close actions dropdown on click outside or Escape */
  useEffect(() => {
    const clickHandler = ({target}) => {
      if (
        !actionsDropdownOpen ||
        actionsDropdownRef.current?.contains(target) ||
        actionsTriggerRef.current?.contains(target)
      )
        return;
      setActionsDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [actionsDropdownOpen]);
  useEffect(() => {
    const keyHandler = ({keyCode}) => {
      if (!actionsDropdownOpen || keyCode !== 27) return;
      setActionsDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [actionsDropdownOpen]);

  /* Open systems setup modal on load only when creating a new property */
  useEffect(() => {
    if (uid === "new") {
      setSystemsSetupModalOpen(true);
    }
  }, [uid]);

  /* Get property by ID and its systems */
  useEffect(() => {
    async function loadPropertyAndSystems() {
      if (uid === "new") return;
      /* Use preloaded data from create flow to avoid blank/loading state */
      const preloaded = location.state?.createdProperty;
      const preloadedUid = location.state?.createdPropertyUid;
      if (preloaded && preloadedUid === uid) {
        dispatch({
          type: "SET_PROPERTY",
          payload: preloaded,
        });
        const propertyId = preloaded.identity?.id ?? preloaded.id;
        if (propertyId) {
          const systemsArr = await getSystemsByPropertyId(propertyId);
          dispatch({type: "SET_SYSTEMS", payload: systemsArr ?? []});
        }
        return;
      }
      try {
        const property = await getPropertyById(uid);
        const systemsArr = await getSystemsByPropertyId(property.id);
        const rawRecords = await getMaintenanceRecordsByPropertyId(property.id);
        const maintenanceRecords = mapMaintenanceRecordsFromBackend(
          rawRecords ?? [],
        );
        setMaintenanceRecords(maintenanceRecords);
        originalMaintenanceRecordIdsRef.current = new Set(
          (maintenanceRecords ?? [])
            .filter((r) => !isNewMaintenanceRecord(r))
            .map((r) => r.id),
        );
        const includedSystems = (systemsArr ?? []).filter(
          (s) => s.included !== false,
        );
        const flat = mapPropertyFromBackend(property) ?? property;
        const tabbed = splitFormDataByTabs(flat);
        const fromSystems = mapSystemsFromBackend(includedSystems);
        const selectedIdsFromBackend = includedSystems
          .map((s) => s.system_key ?? s.systemKey)
          .filter((k) => k && !k.startsWith("custom-"));
        const customNamesFromBackend = Object.keys(
          fromSystems.customSystemsData ?? {},
        );
        dispatch({
          type: "SET_PROPERTY",
          payload: {
            ...tabbed,
            maintenanceRecords: maintenanceRecords ?? [],
            systems: {
              ...tabbed.systems,
              ...fromSystems,
              selectedSystemIds:
                selectedIdsFromBackend.length > 0
                  ? selectedIdsFromBackend
                  : (tabbed.systems.selectedSystemIds ?? []),
              customSystemNames:
                customNamesFromBackend.length > 0
                  ? customNamesFromBackend
                  : (tabbed.systems.customSystemNames ?? []),
              customSystemsData:
                fromSystems.customSystemsData ??
                tabbed.systems.customSystemsData ??
                {},
            },
          },
        });
        dispatch({type: "SET_SYSTEMS", payload: systemsArr ?? []});
      } catch (err) {
        if (err instanceof ApiError) {
          if (isPropertyNotFoundError(err)) {
            dispatch({type: "SET_PROPERTY_NOT_FOUND", payload: true});
          } else if (err.status === 403) {
            dispatch({type: "SET_PROPERTY_ACCESS_DENIED", payload: true});
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
    }
    loadPropertyAndSystems();
  }, [uid]);

  /* Reset form when navigating TO new from another property (not on initial mount); clear 403 when uid changes */
  const prevUidRef = useRef(null);
  useEffect(() => {
    if (uid === "new") {
      const cameFromOtherProperty =
        prevUidRef.current != null && prevUidRef.current !== "new";
      if (cameFromOtherProperty) {
        dispatch({type: "SET_PROPERTY", payload: null});
        dispatch({type: "SET_SYSTEMS", payload: []});
        dispatch({type: "SET_PROPERTY_ACCESS_DENIED", payload: false});
        dispatch({type: "SET_PROPERTY_NOT_FOUND", payload: false});
        setHomeopsTeam([]);
      }
    } else if (prevUidRef.current !== uid) {
      dispatch({type: "SET_PROPERTY_ACCESS_DENIED", payload: false});
      dispatch({type: "SET_PROPERTY_NOT_FOUND", payload: false});
    }
    prevUidRef.current = uid;
  }, [uid]);

  /* New property: ensure at least the creator is on the team (cannot be removed in modal) */
  useEffect(() => {
    if (uid !== "new" || !currentUser?.id) return;
    setHomeopsTeam((prev) => {
      if (prev.length > 0) return prev;
      const creator = getCreatorAsTeamMember(currentUser);
      return creator ? [creator] : prev;
    });
  }, [uid, currentUser?.id, currentUser?.name, currentUser?.role]);

  /* Clear main photo preview and presigned URL when switching properties */
  const prevPropertyUidRef = useRef(null);
  useEffect(() => {
    const currentUid =
      state.property?.id ?? state.property?.identity?.id ?? null;
    const switched =
      prevPropertyUidRef.current != null &&
      currentUid !== prevPropertyUidRef.current;
    const cleared = prevPropertyUidRef.current != null && currentUid == null;
    prevPropertyUidRef.current = currentUid;
    if (switched || cleared) {
      clearMainPhotoPreview();
      clearMainPhotoUploadedUrl();
      clearMainPhotoPresignedUrl();
    }
  }, [
    state.property,
    clearMainPhotoPreview,
    clearMainPhotoUploadedUrl,
    clearMainPhotoPresignedUrl,
  ]);

  /* Show main photo upload error in the top banner instead of under the image */
  useEffect(() => {
    if (mainPhotoUploadError) {
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: mainPhotoUploadError,
        },
      });
    }
  }, [mainPhotoUploadError]);

  /* Sets default HomeOps Team (only for existing properties; new form keeps team [] from reset effect). Enrich with property_role as role and user image from context so photos and roles display after save/refetch. */
  useEffect(() => {
    async function setDefaultHomeopsTeam() {
      if (uid === "new") return;
      const team = await getPropertyTeam(uid);
      const raw = team?.property_users ?? [];
      const enriched = raw.map((m) => {
        const u = users?.find(
          (us) => us && m?.id != null && Number(us.id) === Number(m.id),
        );
        return {
          ...m,
          role: m.property_role ?? m.role,
          image_url: m.image_url ?? u?.image_url,
          image: m.image ?? u?.image,
        };
      });
      setHomeopsTeam(enriched);
    }
    setDefaultHomeopsTeam();
  }, [uid, currentUser?.id, state.property]);

  /* Handles the change of the property */
  const handleChange = (event) => {
    const {name, value} = event.target;
    if (state.errors[name]) {
      dispatch({
        type: "SET_ERRORS",
        payload: {...state.errors, [name]: null},
      });
    }
    if (name.startsWith("customSystem_")) {
      const rest = name.slice("customSystem_".length);
      const sep = "::";
      const idx = rest.lastIndexOf(sep);
      const systemName = idx >= 0 ? rest.slice(0, idx) : rest;
      const fieldKey = idx >= 0 ? rest.slice(idx + sep.length) : "";
      if (systemName && fieldKey) {
        const prev = state.formData.systems?.customSystemsData ?? {};
        const prevSystem = prev[systemName] ?? {};
        dispatch({
          type: "SET_SYSTEMS_FORM_DATA",
          payload: {
            customSystemsData: {
              ...prev,
              [systemName]: {...prevSystem, [fieldKey]: value},
            },
          },
        });
      }
      if (state.isInitialLoad) {
        dispatch({type: "SET_FORM_CHANGED", payload: true});
      }
      return;
    }
    if (SYSTEM_FIELD_NAMES.has(name)) {
      const processed = value;
      dispatch({type: "SET_SYSTEMS_FORM_DATA", payload: {[name]: processed}});
      if (state.isInitialLoad) {
        dispatch({type: "SET_FORM_CHANGED", payload: true});
      }
      return;
    }
    const numericFields = [
      "price",
      "squareFeet",
      "rooms",
      "bathrooms",
      "yearBuilt",
    ];
    const processed = numericFields.includes(name)
      ? value === ""
        ? null
        : Number(value)
      : value;
    dispatch({type: "SET_IDENTITY_FORM_DATA", payload: {[name]: processed}});
    if (state.isInitialLoad) {
      dispatch({type: "SET_FORM_CHANGED", payload: true});
    }
  };

  // Ref so systems completion callback always sees latest healthMetrics (avoids stale closure)
  const formDataRef = useRef(state.formData);
  formDataRef.current = state.formData;

  /* Handles changes in systems section completion – updates healthMetrics for persistence */
  const handleSystemsCompletionChange = useCallback(
    (completedCount, totalCount) => {
      const currentHealthMetrics =
        formDataRef.current?.identity?.healthMetrics ?? {};
      const currentSystemsIdentified =
        currentHealthMetrics.systemsIdentified ?? {
          current: 0,
          total: totalCount,
        };
      if (
        currentSystemsIdentified.current !== completedCount ||
        currentSystemsIdentified.total !== totalCount
      ) {
        dispatch({
          type: "SET_IDENTITY_FORM_DATA",
          payload: {
            healthMetrics: {
              ...currentHealthMetrics,
              systemsIdentified: {
                current: completedCount,
                total: totalCount,
              },
            },
          },
        });
      }
    },
    [],
  );

  /* Required identity fields for create (backend expects strings). */
  const REQUIRED_IDENTITY_FIELDS = [
    {key: "address", label: "Address"},
    {key: "city", label: "City"},
    {key: "state", label: "State"},
    {key: "zip", label: "ZIP"},
  ];

  /* Handles the submission of the property (create) */
  async function handleSubmit(event) {
    event.preventDefault();
    const identity = state.formData.identity ?? {};
    const missing = REQUIRED_IDENTITY_FIELDS.filter(({key}) => {
      const v = identity[key];
      return v == null || (typeof v === "string" && !v.trim());
    });
    if (missing.length > 0) {
      const newErrors = {};
      missing.forEach(({key, label}) => {
        newErrors[key] = `${label} is required`;
      });
      dispatch({type: "SET_VALIDATION_FAILED", payload: {errors: newErrors}});
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Please fill in the required fields: ${missing
            .map(({label}) => label)
            .join(", ")}.`,
        },
      });
      return;
    }
    dispatch({type: "SET_ERRORS", payload: {}});
    dispatch({type: "SET_SUBMITTING", payload: true});
    try {
      const merged = mergeFormDataFromTabs(state.formData);
      merged.hpsScore = computeHpsScore(merged);
      const propertyData = preparePropertyValues(merged);
      propertyData.account_id = currentAccount?.id;
      const res = await createProperty(propertyData);
      if (res) {
        const propertyId = res.id;
        /* Add users to property */
        if (homeopsTeam.length > 0) {
          await addUsersToProperty(
            propertyId,
            prepareTeamForProperty(homeopsTeam),
          );
        }
        const systemsPayloads = prepareSystemsForApi(
          state.formData.systems ?? {},
          propertyId,
        );
        /* Create systems for property */
        await createSystemsForProperty(propertyId, systemsPayloads);
        const newUid = res.property_uid ?? res.id;

        /* Create maintenance records for property (batch endpoint) */
        const recordsToCreate = state.formData.maintenanceRecords ?? [];
        const recordsWithoutDate = recordsToCreate.filter(
          (r) => !(r.date != null && String(r.date).trim()),
        );
        if (recordsWithoutDate.length > 0) {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "error",
              message: `Please add a date to all maintenance records before saving. ${recordsWithoutDate.length} record(s) are missing a date.`,
            },
          });
          dispatch({type: "SET_SUBMITTING", payload: false});
          return;
        }
        const payloads = prepareMaintenanceRecordsForApi(
          recordsToCreate,
          propertyId,
        );
        if (payloads.length > 0) {
          await createMaintenanceRecords(propertyId, payloads);
        }

        /* Fetch the created property so we can pass it in nav state and avoid the loading/blank screen */
        const refreshed = await getPropertyById(newUid);
        const rawRecords = await getMaintenanceRecordsByPropertyId(propertyId);
        const maintenanceRecordsFromCreate = mapMaintenanceRecordsFromBackend(
          rawRecords ?? [],
        );
        setMaintenanceRecords(maintenanceRecordsFromCreate);
        originalMaintenanceRecordIdsRef.current = new Set(
          (maintenanceRecordsFromCreate ?? [])
            .filter((r) => !isNewMaintenanceRecord(r))
            .map((r) => r.id),
        );
        const systemsFromBackend = await getSystemsByPropertyId(propertyId);
        const preloadedPayload = {
          ...buildPropertyPayloadFromRefresh(
            refreshed,
            systemsFromBackend ?? [],
            res,
          ),
          maintenanceRecords: maintenanceRecordsFromCreate ?? [],
        };

        navigate(`/${accountUrl}/properties/${newUid}`, {
          replace: true,
          state: {
            createdProperty: preloadedPayload,
            createdPropertyUid: newUid,
            currentIndex: properties.length + 1,
            totalItems: properties.length + 1,
            visiblePropertyIds: [
              ...properties.map((p) => p.property_uid ?? p.id),
              newUid,
            ],
          },
        });
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message: t("propertyCreatedSuccessfullyMessage"),
          },
        });
      } else {
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "error",
            message: t("propertyCreateErrorMessage"),
          },
        });
      }
    } catch (err) {
      console.error("Error creating property:", err);
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message:
            t("propertyCreateErrorMessage") +
            (err?.message ? ` ${err.message}` : ""),
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  const handleBackToProperties = () => navigate(`/${accountUrl}/properties`);
  const handleNewProperty = () => navigate(`/${accountUrl}/properties/new`);

  const handleTeamChange = (team) => {
    setHomeopsTeam(team);
    dispatch({type: "SET_FORM_CHANGED", payload: true});
  };

  const handleCancelChanges = () => {
    if (state.property) {
      dispatch({type: "SET_PROPERTY", payload: state.property});
      dispatch({type: "SET_FORM_CHANGED", payload: false});
    } else {
      dispatch({type: "SET_PROPERTY", payload: null});
      navigate(`/${accountUrl}/properties`);
    }
  };

  async function handleUpdate(event) {
    event.preventDefault();
    const identity = state.formData.identity ?? {};
    const missing = REQUIRED_IDENTITY_FIELDS.filter(({key}) => {
      const v = identity[key];
      return v == null || (typeof v === "string" && !v.trim());
    });
    if (missing.length > 0) {
      const newErrors = {};
      missing.forEach(({key, label}) => {
        newErrors[key] = `${label} is required`;
      });
      dispatch({type: "SET_VALIDATION_FAILED", payload: {errors: newErrors}});
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message: `Please fill in the required fields: ${missing
            .map(({label}) => label)
            .join(", ")}.`,
        },
      });
      return;
    }
    dispatch({type: "SET_ERRORS", payload: {}});
    dispatch({type: "SET_SUBMITTING", payload: true});
    try {
      const propertyId = state.property?.identity?.id ?? state.property?.id;
      const merged = mergeFormDataFromTabs(state.formData);
      const identityPayload = prepareIdentityForUpdate(
        state.formData.identity ?? {},
      );
      identityPayload.hps_score = computeHpsScore(merged);
      const res = await updateProperty(propertyId, identityPayload);
      if (res) {
        await updateTeam(res.id, prepareTeamForProperty(homeopsTeam));

        const teamAfterUpdate = await getPropertyTeam(uid);
        const propertyUsers = teamAfterUpdate?.property_users ?? [];

        /* Only redirect if current user removed themselves (no longer on team). Skip for super_admin – they have platform-wide access and should stay on the property to see the success message. */
        const isSuperAdmin =
          (currentUser?.role ?? "").toLowerCase() === "super_admin";
        if (!isSuperAdmin) {
          const currentUserId = currentUser?.id;
          const stillOnTeam =
            currentUserId == null
              ? true
              : propertyUsers.some(
                  (m) =>
                    m && String(m.id ?? m.user_id) === String(currentUserId),
                );
          if (!stillOnTeam) {
            dispatch({type: "SET_SUBMITTING", payload: false});
            navigate(`/${accountUrl}/properties`);
            return;
          }
        }
        /* Sync local team with server so UI matches after save */
        const enriched = propertyUsers.map((m) => {
          const u = users?.find(
            (us) => us && m?.id != null && Number(us.id) === Number(m.id),
          );
          return {
            ...m,
            role: m.property_role ?? m.role,
            image_url: m.image_url ?? u?.image_url,
            image: m.image ?? u?.image,
          };
        });
        setHomeopsTeam(enriched);

        const systemsArray = formSystemsToArray(
          mergeFormDataFromTabs(state.formData) ?? {},
          res.id,
          state.systems ?? [],
        );
        await updateSystemsForProperty(res.id, systemsArray);

        /* Maintenance records sync */
        const currentRecords = state.formData.maintenanceRecords ?? [];
        const recordsWithoutDate = currentRecords.filter(
          (r) => !(r.date != null && String(r.date).trim()),
        );
        if (recordsWithoutDate.length > 0) {
          dispatch({
            type: "SET_BANNER",
            payload: {
              open: true,
              type: "error",
              message: `Please add a date to all maintenance records before saving. ${recordsWithoutDate.length} record(s) are missing a date.`,
            },
          });
          dispatch({type: "SET_SUBMITTING", payload: false});
          return;
        }
        const syncPlan = computeMaintenanceSyncPlan(
          currentRecords,
          originalMaintenanceRecordIdsRef.current,
          res.id,
        );

        if (syncPlan.toDelete.length > 0) {
          await Promise.all(
            syncPlan.toDelete.map((id) => deleteMaintenanceRecord(id)),
          );
        }
        if (syncPlan.toCreate.length > 0) {
          await createMaintenanceRecords(res.id, syncPlan.toCreate);
        }
        if (syncPlan.toUpdate.length > 0) {
          await Promise.all(
            syncPlan.toUpdate.map(({id, payload}) =>
              updateMaintenanceRecord(id, payload),
            ),
          );
        }

        const refreshed = await getPropertyById(uid);
        const rawRecords = await getMaintenanceRecordsByPropertyId(res.id);
        const maintenanceRecords = mapMaintenanceRecordsFromBackend(
          rawRecords ?? [],
        );
        setMaintenanceRecords(maintenanceRecords);
        originalMaintenanceRecordIdsRef.current = new Set(
          maintenanceRecords
            .filter((r) => !isNewMaintenanceRecord(r))
            .map((r) => r.id),
        );
        const systemsFromBackend = await getSystemsByPropertyId(res.id);
        dispatch({
          type: "REFRESH_PROPERTY_AFTER_SAVE",
          payload: {
            ...buildPropertyPayloadFromRefresh(
              refreshed,
              systemsFromBackend ?? [],
              res,
            ),
            maintenanceRecords: maintenanceRecords ?? [],
          },
        });
        dispatch({type: "SET_SYSTEMS", payload: systemsFromBackend ?? []});
        dispatch({type: "SET_FORM_CHANGED", payload: false});
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "success",
            message: t("propertyUpdatedSuccessfullyMessage"),
          },
        });
      } else {
        dispatch({
          type: "SET_BANNER",
          payload: {
            open: true,
            type: "error",
            message: t("propertyUpdateErrorMessage"),
          },
        });
      }
    } catch (err) {
      console.error("Error updating property:", err);
      dispatch({
        type: "SET_BANNER",
        payload: {
          open: true,
          type: "error",
          message:
            t("propertyUpdateErrorMessage") +
            (err?.message ? ` ${err.message}` : ""),
        },
      });
    } finally {
      dispatch({type: "SET_SUBMITTING", payload: false});
    }
  }

  // Build prev/next nav state; URL param is property_uid. We still track by id internally.
  useAutoCloseBanner(state.bannerOpen, state.bannerMessage, () =>
    dispatch({
      type: "SET_BANNER",
      payload: {
        open: false,
        type: state.bannerType,
        message: state.bannerMessage,
      },
    }),
  );

  const buildNavigationState = (propertyUid) => {
    // Sort by passport_id ascending to match PropertiesList default order
    const sortedProperties = [...properties].sort((a, b) =>
      (a.passport_id || "").localeCompare(b.passport_id || ""),
    );
    const propertyIndex = sortedProperties.findIndex(
      (p) => (p.property_uid ?? p.id) === propertyUid,
    );
    if (propertyIndex === -1) return null;
    return {
      currentIndex: propertyIndex + 1,
      totalItems: sortedProperties.length,
      visiblePropertyIds: sortedProperties.map((p) => p.property_uid ?? p.id),
    };
  };

  // Merged formData for components expecting flat structure
  const mergedFormData = mergeFormDataFromTabs(state.formData);

  // Card shows saved property data only; updates after load or save, not while typing
  const cardData = state.property
    ? mergeFormDataFromTabs(state.property)
    : mergedFormData;

  // HPS score: use backend value when present, otherwise compute from current data so score shows on first load
  const backendScore = cardData.hpsScore ?? cardData.hps_score;
  const hasBackendScore =
    backendScore != null && Number.isFinite(Number(backendScore));
  const displayHpsScore = hasBackendScore
    ? Math.round(Number(backendScore))
    : computeHpsScore(
        state.property ? mergeFormDataFromTabs(state.property) : mergedFormData,
      );

  // Systems to show in Systems tab: only those with included=true (from modal selection)
  const visibleSystemIds = state.formData.systems?.selectedSystemIds ?? [];

  // Array of systems for use when updating systems on the backend (camelCase, backend-ready)
  const propertyId = state.property?.identity?.id ?? state.property?.id;
  const systemsArray = formSystemsToArray(
    mergedFormData ?? {},
    propertyId ?? 0,
    state.systems ?? [],
  );
  /* console.log("systemsArray: ", systemsArray);
  console.log("state.formData: ", state.formData);
  console.log("maintenanceRecords: ", state.formData.maintenanceRecords); */
  console.log("maintenanceRecords: ", maintenanceRecords);
  console.log("Porperty Form Container: ", state.formData);

  // While loading an existing property, don't show empty form; show loading until we get data or a 403/404.
  // Never show loading during save so the form doesn't briefly disappear.
  const loadingExisting =
    uid !== "new" &&
    state.property == null &&
    !state.propertyNotFound &&
    !state.propertyAccessDenied &&
    !state.isSubmitting;
  if (loadingExisting) {
    return (
      <div className="px-4 sm:px-6 lg:px-1 pt-1 flex items-center justify-center min-h-[40vh]">
        <div className="text-gray-500 dark:text-gray-400">
          Loading property...
        </div>
      </div>
    );
  }

  if (state.propertyNotFound && uid !== "new") {
    return (
      <div className="px-4 sm:px-6 lg:px-1 pt-1">
        <PropertyNotFound />
      </div>
    );
  }

  if (state.propertyAccessDenied && uid !== "new") {
    return (
      <div className="px-4 sm:px-6 lg:px-1 pt-1">
        <PropertyUnauthorized />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-1 pt-1">
      <SharePropertyModal
        modalOpen={shareModalOpen}
        setModalOpen={setShareModalOpen}
        propertyAddress={
          [
            state.formData.identity?.address,
            state.formData.identity?.city,
            state.formData.identity?.state,
            state.formData.identity?.zip,
          ]
            .filter(Boolean)
            .join(", ") ||
          state.formData.identity?.fullAddress ||
          ""
        }
        users={users ?? []}
        contacts={contacts ?? []}
        onShareWithUser={async (userId) => {
          // TODO: Call API to share property with user
          await Promise.resolve();
        }}
        onSendByEmail={async ({email: recipientEmail, message: msg}) => {
          // TODO: Call API to send property via email
          await Promise.resolve();
        }}
      />
      <SystemsSetupModal
        modalOpen={systemsSetupModalOpen}
        setModalOpen={setSystemsSetupModalOpen}
        selectedSystemIds={state.formData.systems?.selectedSystemIds ?? []}
        customSystems={state.formData.systems?.customSystemNames ?? []}
        isNewProperty={uid === "new"}
        skipIdentityStep={uid !== "new"}
        formData={mergedFormData}
        onIdentityFieldsChange={(fields) => {
          const payload = {};
          for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined) payload[key] = value;
          }
          dispatch({
            type: "SET_IDENTITY_FORM_DATA",
            payload,
          });
        }}
        onSave={({selectedIds, customNames}) => {
          const names = customNames ?? [];
          const prevData = state.formData.systems?.customSystemsData ?? {};
          const nextData = {};
          names.forEach((name) => {
            nextData[name] =
              prevData[name] ??
              Object.fromEntries(
                STANDARD_CUSTOM_SYSTEM_FIELDS.map((f) => [f.key, ""]),
              );
          });
          const predefinedOnly = (selectedIds ?? []).filter(
            (id) => !String(id).startsWith("custom-"),
          );
          dispatch({
            type: "SET_SYSTEMS_FORM_DATA",
            payload: {
              selectedSystemIds: predefinedOnly,
              customSystemNames: names,
              customSystemsData: nextData,
            },
          });
          dispatch({type: "SET_FORM_CHANGED", payload: true});
        }}
      />
      <div className="fixed top-18 right-0 w-auto sm:w-full z-50">
        <Banner
          type={state.bannerType}
          open={state.bannerOpen}
          setOpen={(open) => {
            if (!open) setMainPhotoUploadError(null);
            dispatch({
              type: "SET_BANNER",
              payload: {
                open,
                type: state.bannerType,
                message: state.bannerMessage,
              },
            });
          }}
          className="transition-opacity duration-300"
        >
          {state.bannerMessage}
        </Banner>
      </div>

      {/* Navigation and Actions */}
      <div className="flex justify-between items-center mb-4">
        <button
          className="btn text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-600 mb-2 pl-0 focus:outline-none shadow-none"
          onClick={handleBackToProperties}
        >
          <svg
            className="fill-current shrink-0 mr-1"
            width="18"
            height="18"
            viewBox="0 0 18 18"
          >
            <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
          </svg>
          <span className="text-lg">Properties</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="relative inline-flex">
            <button
              ref={actionsTriggerRef}
              type="button"
              className="btn px-2.5 bg-white dark:bg-gray-800 border-gray-200 hover:border-gray-300 dark:border-gray-700/60 dark:hover:border-gray-600 text-gray-400 dark:text-gray-500"
              aria-haspopup="true"
              aria-expanded={actionsDropdownOpen}
              onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
            >
              <span className="sr-only">Actions</span>
              <svg
                className="fill-current"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path d="M0 3a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H1a1 1 0 0 1-1-1ZM3 8a1 1 0 0 1 1-1h8a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1ZM7 12a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7Z" />
              </svg>
            </button>
            <Transition
              show={actionsDropdownOpen}
              tag="div"
              className="origin-top-right z-10 absolute top-full left-0 right-auto min-w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700/60 pt-1.5 rounded-lg shadow-xl overflow-hidden mt-1 md:left-auto md:right-0"
              enter="transition ease-out duration-200 transform"
              enterStart="opacity-0 -translate-y-2"
              enterEnd="opacity-100 translate-y-0"
              leave="transition ease-out duration-200"
              leaveStart="opacity-100"
              leaveEnd="opacity-0"
            >
              <div ref={actionsDropdownRef}>
                <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase pt-1.5 pb-2 px-3">
                  {t("actions")}
                </div>
                <ul className="mb-1">
                  <li>
                    <button
                      type="button"
                      className="w-full flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionsDropdownOpen(false);
                        setSystemsSetupModalOpen(true);
                      }}
                    >
                      <Settings className="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium ml-2">
                        {t("configure") || "Configure"}
                      </span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      className="w-full flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActionsDropdownOpen(false);
                        // TODO: Call API to generate PDF report
                        dispatch({
                          type: "SET_BANNER",
                          payload: {
                            open: true,
                            type: "success",
                            message:
                              "Report generation is not yet implemented.",
                          },
                        });
                      }}
                    >
                      <FileBarChart className="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm font-medium ml-2">
                        Generate report
                      </span>
                    </button>
                  </li>
                </ul>
              </div>
            </Transition>
          </div>
          <button
            className="btn bg-[#456564] hover:bg-[#34514f] text-white transition-colors duration-200 shadow-sm"
            onClick={handleNewProperty}
          >
            {t("new")}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        {/* Report and Share buttons - Left aligned (similar to Contact in UserFormContainer) */}
        <div className="flex items-center gap-3 ml-4">
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-all duration-200"
            title="Property report (PDF)"
          >
            <FileBarChart className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">
              Report <span className="font-normal">{hasReport ? 1 : 0}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShareModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 transition-all duration-200"
          >
            <Share2 className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm font-semibold">Share</span>
          </button>
        </div>

        {/* Property Navigation */}
        <div className="flex items-center">
          {uid &&
            uid !== "new" &&
            (() => {
              // Use location.state if available, otherwise build from properties
              const navState = location.state || buildNavigationState(uid);

              if (!navState) return null;

              return (
                <>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                    {navState.currentIndex || 1} / {navState.totalItems || 1}
                  </span>
                  <button
                    className="btn shadow-none p-1"
                    title="Previous"
                    onClick={() => {
                      if (
                        navState.visiblePropertyIds &&
                        navState.currentIndex > 1
                      ) {
                        const prevIndex = navState.currentIndex - 2;
                        const prevPropertyId =
                          navState.visiblePropertyIds[prevIndex];
                        const prevNavState =
                          buildNavigationState(prevPropertyId);
                        navigate(`/${accountUrl}/properties/${prevPropertyId}`, {
                          state: prevNavState || {
                            ...navState,
                            currentIndex: navState.currentIndex - 1,
                          },
                        });
                      }
                    }}
                    disabled={
                      !navState.currentIndex || navState.currentIndex <= 1
                    }
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        !navState.currentIndex || navState.currentIndex <= 1
                          ? "text-gray-200 dark:text-gray-700"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-600"
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 18 18"
                    >
                      <path d="M9.4 13.4l1.4-1.4-4-4 4-4-1.4-1.4L4 8z"></path>
                    </svg>
                  </button>

                  <button
                    className="btn shadow-none p-1"
                    title="Next"
                    onClick={() => {
                      if (
                        navState.visiblePropertyIds &&
                        navState.currentIndex < navState.totalItems
                      ) {
                        const nextIndex = navState.currentIndex;
                        const nextPropertyId =
                          navState.visiblePropertyIds[nextIndex];
                        const nextNavState =
                          buildNavigationState(nextPropertyId);
                        navigate(`/${accountUrl}/properties/${nextPropertyId}`, {
                          state: nextNavState || {
                            ...navState,
                            currentIndex: navState.currentIndex + 1,
                          },
                        });
                      }
                    }}
                    disabled={
                      !navState.currentIndex ||
                      !navState.totalItems ||
                      navState.currentIndex >= navState.totalItems
                    }
                  >
                    <svg
                      className={`fill-current shrink-0 ${
                        !navState.currentIndex ||
                        !navState.totalItems ||
                        navState.currentIndex >= navState.totalItems
                          ? "text-gray-200 dark:text-gray-700"
                          : "text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-600"
                      }`}
                      width="24"
                      height="24"
                      viewBox="0 0 18 18"
                    >
                      <path d="M6.6 13.4L5.2 12l4-4-4-4 1.4-1.4L12 8z"></path>
                    </svg>
                  </button>
                </>
              );
            })()}
        </div>
      </div>

      <div className="space-y-8">
        {/* Property Passport Card */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Passport Header - solid background (gradient only on ScoreCard) */}
          <div className="relative bg-[#3a5548] px-5 py-4 overflow-hidden">
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "24px 24px",
                }}
              ></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5a7a78] rounded-full border-2 border-[#2a4241]"></div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white mb-0.5 tracking-tight">
                    Home Passport
                  </h2>
                  <p className="text-xs text-white/70 font-medium">
                    Digital Property Record
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <div className="text-xs text-white/60 uppercase tracking-wider mb-1">
                    Health Score
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {displayHpsScore}/100
                  </div>
                </div>
                <CircularProgress
                  percentage={displayHpsScore}
                  size={68}
                  strokeWidth={5}
                  colorClass={
                    displayHpsScore >= 60
                      ? "text-green-400 dark:text-green-500"
                      : displayHpsScore >= 40
                        ? "text-amber-400 dark:text-amber-500"
                        : "text-red-400 dark:text-red-500"
                  }
                />
              </div>
            </div>
          </div>

          {/* Passport Body */}
          <div className="p-5 md:p-6">
            <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">
              {/* Property Image */}
              <div className="w-full lg:w-2/5 flex-shrink-0">
                <div className="relative h-52 lg:h-72 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm">
                  <ImageUploadField
                    imageSrc={
                      mainPhotoPreviewUrl ||
                      (state.formData.identity?.mainPhoto !== ""
                        ? cardData.mainPhotoUrl
                        : null) ||
                      (state.formData.identity?.mainPhoto !== ""
                        ? cardData.mainPhoto?.startsWith?.("blob:")
                          ? cardData.mainPhoto
                          : null
                        : null) ||
                      (mainPhotoPresignedKey === mainPhotoKey
                        ? mainPhotoPresignedUrl
                        : null) ||
                      mainPhotoUploadedUrl
                    }
                    hasImage={
                      !!(
                        state.formData.identity?.mainPhoto ||
                        mainPhotoPreviewUrl ||
                        mainPhotoUploadedUrl ||
                        (state.formData.identity?.mainPhoto !== "" &&
                          (cardData.mainPhoto || cardData.mainPhotoUrl))
                      )
                    }
                    imageUploading={mainPhotoUploading}
                    onUpload={uploadMainPhoto}
                    onRemove={() => {
                      clearMainPhotoPreview();
                      clearMainPhotoUploadedUrl();
                      clearMainPhotoPresignedUrl();
                      dispatch({
                        type: "SET_IDENTITY_FORM_DATA",
                        payload: {mainPhoto: ""},
                      });
                      if (state.isInitialLoad) {
                        dispatch({type: "SET_FORM_CHANGED", payload: true});
                      }
                    }}
                    onPasteUrl={null}
                    showRemove={
                      !!(
                        state.formData.identity?.mainPhoto ||
                        mainPhotoPreviewUrl ||
                        mainPhotoUploadedUrl ||
                        (state.formData.identity?.mainPhoto !== "" &&
                          (cardData.mainPhoto || cardData.mainPhotoUrl))
                      )
                    }
                    imageUploadError={null}
                    onDismissError={() => setMainPhotoUploadError(null)}
                    size="xl"
                    placeholder="generic"
                    emptyLabel="Add image"
                    alt={cardData.address || "Property"}
                    uploadLabel="Upload photo"
                    removeLabel="Remove photo"
                    fileInputRef={mainPhotoInputRef}
                    menuOpen={mainPhotoMenuOpen}
                    onMenuToggle={setMainPhotoMenuOpen}
                  />
                </div>
              </div>

              {/* Property Information */}
              <div className="flex-1 space-y-5">
                {/* Property Identity */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MapPin className="w-4 h-4 text-[#456564] dark:text-[#5a7a78]" />
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          Property Location
                        </span>
                      </div>
                      {cardData.propertyName && (
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-0.5 leading-tight">
                          {cardData.propertyName}
                        </h1>
                      )}
                      <h1
                        className={`${cardData.propertyName ? "text-base text-gray-600 dark:text-gray-300" : "text-xl md:text-2xl text-gray-900 dark:text-white"} font-bold mb-1 leading-tight`}
                      >
                        {cardData.address || "—"}
                      </h1>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                        {[cardData.city, cardData.state, cardData.zip]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Passport ID */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      {/* FileCheck: Lucide icon for the Passport ID label */}
                      <FileCheck className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        Passport ID
                      </span>
                    </div>
                    <p className="text-sm font-mono text-gray-700 dark:text-gray-300 font-semibold">
                      {cardData.passportId ?? cardData.passport_id ?? "—"}
                    </p>
                  </div>
                </div>

                {/* Property Specifications */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Property Specifications
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bed className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Bedrooms
                        </span>
                      </div>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        {cardData.rooms ?? cardData.bedCount ?? "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Bath className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Bathrooms
                        </span>
                      </div>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        {cardData.bathrooms ?? cardData.bathCount ?? "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Ruler className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Square Feet
                        </span>
                      </div>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        {(cardData.squareFeet ?? cardData.sqFtTotal) != null
                          ? Number(
                              cardData.squareFeet ?? cardData.sqFtTotal,
                            ).toLocaleString()
                          : "—"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Year Built
                        </span>
                      </div>
                      <span className="text-base font-semibold text-gray-900 dark:text-white">
                        {cardData.yearBuilt ?? "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Value */}
                {cardData.price != null && cardData.price !== "" && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-0.5">
                          Estimated Value
                        </span>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency.format(cardData.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* HomeOps Team */}
        <HomeOpsTeam
          teamMembers={homeopsTeam}
          propertyId={state.formData.identity?.id ?? uid ?? "new"}
          accountUrl={accountUrl}
          onTeamChange={handleTeamChange}
          creatorId={uid === "new" ? currentUser?.id : undefined}
          canEditAgent={currentUser?.role?.toLowerCase() !== "homeowner"}
        />

        {/* Property Health & Completeness */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 md:p-6">
          <ScoreCard propertyData={mergedFormData} />
        </section>

        {/* Navigation Tabs */}
        <section
          className={`bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 ${
            state.formDataChanged || state.isNew
              ? "rounded-t-2xl border-b-0"
              : "rounded-2xl"
          }`}
        >
          <div className="border-b border-gray-200 dark:border-gray-700 px-6">
            <nav className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const icons = {
                  identity: FileText,
                  systems: Settings,
                  maintenance: Wrench,
                  documents: FileText,
                  media: ImageIcon,
                };
                const Icon = icons[tab.id] || FileText;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      dispatch({type: "SET_ACTIVE_TAB", payload: tab.id})
                    }
                    className={`py-4 px-4 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
                      state.activeTab === tab.id
                        ? "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    style={
                      state.activeTab === tab.id
                        ? {
                            borderBottomColor: "#456654",
                            color: "#456654",
                          }
                        : {}
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="p-6">
            {state.activeTab === "identity" && (
              <IdentityTab
                propertyData={mergedFormData}
                handleInputChange={handleChange}
                errors={state.errors}
                addressInputRef={identityAddressRef}
                placesLoaded={identityPlacesLoaded}
                placesError={identityPlacesError}
              />
            )}

            {state.activeTab === "systems" && (
              <SystemsTab
                propertyData={mergedFormData}
                handleInputChange={handleChange}
                visibleSystemIds={visibleSystemIds}
                customSystemsData={
                  state.formData.systems?.customSystemsData ?? {}
                }
                onSystemsCompletionChange={handleSystemsCompletionChange}
              />
            )}

            {state.activeTab === "maintenance" && (
              <MaintenanceTab
                propertyData={mergedFormData}
                maintenanceRecords={state.formData.maintenanceRecords ?? []}
                savedMaintenanceRecords={state.savedMaintenanceRecords ?? []}
                onMaintenanceRecordsChange={(records) =>
                  dispatch({
                    type: "SET_MAINTENANCE_FORM_DATA",
                    payload: records,
                  })
                }
                onMaintenanceRecordAdded={() => {
                  setTimeout(() => {
                    saveBarRef.current?.scrollIntoView?.({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  }, 100);
                }}
                contacts={contacts ?? []}
              />
            )}

            {state.activeTab === "media" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Media Content
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(state.formData.identity?.photos ?? []).map(
                      (photo, index) => (
                        <div
                          key={photo}
                          className="relative overflow-hidden rounded-2xl h-48 bg-gray-100"
                        >
                          <img
                            src={photo}
                            alt={`Property photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}

            {state.activeTab === "photos" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(state.formData.identity?.photos ?? []).map((photo, index) => (
                  <div
                    key={photo}
                    className="relative overflow-hidden rounded-2xl h-48 bg-gray-100"
                  >
                    <img
                      src={photo}
                      alt={`Property photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {state.activeTab === "documents" && (
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mr-2" />
                    Loading documents…
                  </div>
                }
              >
                <DocumentsTab propertyData={mergedFormData} />
              </React.Suspense>
            )}
          </div>
        </section>

        {/* Save/Cancel bar - sticky at bottom, visible as soon as form is in view */}
        <div
          ref={saveBarRef}
          className={`${
            state.formDataChanged || state.isNew ? "sticky" : "hidden"
          } bottom-0 -mt-8 bg-white dark:bg-gray-800 border-t border-x border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-b-2xl transition-all duration-200`}
        >
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-800 dark:text-gray-300 transition-colors duration-200 shadow-sm"
              onClick={handleCancelChanges}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn text-white transition-colors duration-200 shadow-sm min-w-[100px] bg-[#456564] hover:bg-[#34514f] flex items-center justify-center gap-2"
              onClick={state.isNew ? handleSubmit : handleUpdate}
            >
              {state.isSubmitting && (
                <Loader2
                  className="w-4 h-4 animate-spin shrink-0"
                  aria-hidden
                />
              )}
              {state.isSubmitting
                ? state.isNew
                  ? "Saving..."
                  : "Updating..."
                : state.isNew
                  ? "Save"
                  : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyFormContainer;
