import { SYSTEM_SECTIONS } from "../constants/systemSections";

/** system_key from backend -> form field prefix (exterior uses "siding" in form) */
const SYSTEM_KEY_TO_PREFIX = {
  roof: "roof",
  gutters: "gutter",
  foundation: "foundation",
  exterior: "siding",
  windows: "window",
  heating: "heating",
  ac: "ac",
  waterHeating: "waterHeating",
  electrical: "electrical",
  plumbing: "plumbing",
  safety: "safety",
  inspections: "", // inspections fields use direct camelCase (generalInspection, roofInspection, etc.)
};

/** Convert snake_case to camelCase */
function toCamelCase(str) {
  if (!str || typeof str !== "string") return str;
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/** Convert snake_case key to form field (prefix + CamelCase). installer_id -> prefixInstaller */
function snakeToFormField(prefix, snakeKey) {
  if (snakeKey === "installer_id") {
    return prefix + "Installer";
  }
  const camel = toCamelCase(snakeKey);
  const capitalized = camel.charAt(0).toUpperCase() + camel.slice(1);
  return prefix + capitalized;
}

/** Map a single predefined system's data object to flat form fields */
function mapPredefinedSystemData(systemKey, data, nextServiceDate) {
  const prefix = SYSTEM_KEY_TO_PREFIX[systemKey];
  const section = SYSTEM_SECTIONS[systemKey];
  if (section == null || !data || typeof data !== "object") return {};
  const out = {};

  for (const [snakeKey, value] of Object.entries(data)) {
    if (value == null || value === "") continue;
    const formKey = prefix
      ? snakeToFormField(prefix, snakeKey)
      : toCamelCase(snakeKey);
    out[formKey] = typeof value === "string" ? value.trim() : value;
  }

  if (nextServiceDate && typeof nextServiceDate === "string") {
    const nextField = {
      foundation: "foundationNextInspection",
    }[systemKey];
    if (nextField) {
      out[nextField] = nextServiceDate.trim();
    }
  }

  return out;
}

/** Map custom system data to customSystemsData format. systemKey e.g. "custom-pool" -> name "Pool" */
function mapCustomSystemData(systemKey, data, nextServiceDate) {
  if (!systemKey?.startsWith("custom-") || !data || typeof data !== "object")
    return null;

  const slug = systemKey.replace(/^custom-/, "");
  const systemName = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  const raw = {};
  for (const [snakeKey, value] of Object.entries(data)) {
    if (value == null || value === "") continue;
    const camelKey = toCamelCase(snakeKey);
    if (snakeKey === "installer_id" || camelKey === "installerId")
      raw.installer = value;
    else raw[camelKey] = typeof value === "string" ? value.trim() : value;
  }
  if (nextServiceDate && typeof nextServiceDate === "string") {
    raw.nextInspection = nextServiceDate.trim();
  }
  return { systemName, data: raw };
}

/**
 * Convert backend systems array to flat form data for SystemsTab.
 * Systems are stored separately on the backend; this merges them into the flat structure
 * that SystemsTab expects (roofInstallDate, roofInstaller, etc.).
 *
 * @param {Array} systems - Backend systems array [{ system_key, data, next_service_date }, ...]
 * @returns {Object} Flat form data with system fields
 */
export function mapSystemsFromBackend(systems) {
  if (!Array.isArray(systems) || systems.length === 0) return {};

  const formData = {};
  const customSystemsData = {};

  for (const sys of systems) {
    const key = sys.system_key ?? sys.systemKey;
    const data = sys.data ?? {};
    const nextService = sys.next_service_date ?? sys.nextServiceDate;

    if (!key) continue;

    if (key.startsWith("custom-")) {
      const mapped = mapCustomSystemData(key, data, nextService);
      if (mapped) {
        const name = mapped.systemName;
        customSystemsData[name] = {
          ...(customSystemsData[name] ?? {}),
          ...mapped.data,
        };
      }
    } else {
      Object.assign(
        formData,
        mapPredefinedSystemData(key, data, nextService)
      );
    }
  }

  const out = { ...formData };
  if (Object.keys(customSystemsData).length > 0) {
    out.customSystemsData = customSystemsData;
  }
  return out;
}
