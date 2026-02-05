import { SYSTEM_SECTIONS } from "../constants/systemSections";
import { STANDARD_CUSTOM_SYSTEM_FIELDS } from "../constants/propertySystems";

/** Fields that map to next_service_date per system */
const NEXT_SERVICE_FIELD_BY_SYSTEM = {
  roof: "roofNextInspection",
  gutters: "gutterNextInspection",
  foundation: "foundationNextInspection",
  exterior: "sidingNextInspection",
  windows: "windowNextInspection",
  heating: "heatingNextInspection",
  ac: "acNextInspection",
  waterHeating: "waterHeatingNextInspection",
  electrical: "electricalNextInspection",
  plumbing: "plumbingNextInspection",
};

/** Convert camelCase to snake_case */
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

/** Coerce value to integer or null */
function coerceInt(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/**
 * Build data object for a predefined system from formData.
 * Extracts only the fields defined in SYSTEM_SECTIONS and converts keys to snake_case.
 * Installer fields are sent as installer_id (integer) instead of installer (name).
 */
function buildPredefinedSystemData(formData, systemId) {
  const section = SYSTEM_SECTIONS[systemId];
  if (!section) return {};

  const prefix = section.id;
  const data = {};
  for (const field of section.fields) {
    const val = formData[field];
    if (val == null || val === "") continue;

    const suffix = field.startsWith(prefix)
      ? field.slice(prefix.length).replace(/^./, (c) => c.toLowerCase())
      : field;
    const snakeKey = toSnakeCase(suffix || field);

    if (field.endsWith("Installer")) {
      const idVal = coerceInt(val);
      if (idVal !== null) data.installer_id = idVal;
    } else {
      data[snakeKey] = typeof val === "string" ? val.trim() : val;
    }
  }
  return data;
}

/**
 * Build data object for a custom system from customSystemsData.
 * Installer field is sent as installer_id (integer) instead of installer (name).
 */
function buildCustomSystemData(customSystemsData, systemName) {
  const raw = customSystemsData?.[systemName] ?? {};
  const data = {};
  for (const { key } of STANDARD_CUSTOM_SYSTEM_FIELDS) {
    const val = raw[key];
    if (val == null || val === "") continue;

    if (key === "installer") {
      const idVal = coerceInt(val);
      if (idVal !== null) data.installer_id = idVal;
    } else {
      data[toSnakeCase(key)] = typeof val === "string" ? val.trim() : val;
    }
  }
  return data;
}

/**
 * Get next_service_date for a predefined system if available.
 */
function getNextServiceDate(formData, systemId) {
  const field = NEXT_SERVICE_FIELD_BY_SYSTEM[systemId];
  if (!field) return null;
  const val = formData[field];
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed || null;
}

/**
 * Get next_service_date for a custom system (nextInspection field).
 */
function getCustomNextServiceDate(customSystemsData, systemName) {
  const raw = customSystemsData?.[systemName] ?? {};
  const val = raw.nextInspection;
  if (!val || typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed || null;
}

/**
 * Create a URL-safe slug from a custom system name.
 */
function slugifyCustomSystemName(name) {
  if (!name || typeof name !== "string") return "custom-unknown";
  return "custom-" + name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

/**
 * Build array of system payloads for the property_systems API.
 * Each payload: { property_id, system_key, data, next_service_date? }
 *
 * @param {Object} formData - Full property form data
 * @param {number} propertyId - Property ID (from create response)
 * @returns {Array<{ property_id: number, system_key: string, data: Object, next_service_date?: string }>}
 */
export function prepareSystemsForApi(formData, propertyId) {
  const systems = [];
  const selectedIds = formData.selectedSystemIds ?? [];
  const customNames = formData.customSystemNames ?? [];
  const customData = formData.customSystemsData ?? {};

  const visibleIds = selectedIds.length > 0 ? selectedIds : ["roof", "gutters", "heating", "ac", "electrical", "plumbing"];

  for (const systemId of visibleIds) {
    const data = buildPredefinedSystemData(formData, systemId);
    const nextServiceDate = getNextServiceDate(formData, systemId);

    systems.push({
      property_id: propertyId,
      system_key: systemId,
      data: Object.keys(data).length > 0 ? data : {},
      ...(nextServiceDate && { next_service_date: nextServiceDate }),
    });
  }

  for (const systemName of customNames) {
    const data = buildCustomSystemData(customData, systemName);
    const nextServiceDate = getCustomNextServiceDate(customData, systemName);
    const systemKey = slugifyCustomSystemName(systemName);

    systems.push({
      property_id: propertyId,
      system_key: systemKey,
      data: Object.keys(data).length > 0 ? data : {},
      ...(nextServiceDate && { next_service_date: nextServiceDate }),
    });
  }

  return systems;
}
