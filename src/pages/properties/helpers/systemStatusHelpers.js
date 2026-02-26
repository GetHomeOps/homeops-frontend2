/**
 * Helpers for computing system status (Needs Attention, Scheduled Event)
 * used by the Systems tab collapsible headers.
 */

/** systemType -> { lastInspection, nextInspection, condition, issues } field names */
const INSPECTION_FIELDS_BY_SYSTEM = {
  roof: { lastInspection: "roofLastInspection", nextInspection: "roofNextInspection", condition: "roofCondition", issues: "roofIssues" },
  gutters: { lastInspection: "gutterLastInspection", nextInspection: "gutterNextInspection", condition: "gutterCondition", issues: "gutterIssues" },
  foundation: { lastInspection: "foundationLastInspection", nextInspection: "foundationNextInspection", condition: "foundationCondition", issues: "foundationIssues" },
  exterior: { lastInspection: "sidingLastInspection", nextInspection: "sidingNextInspection", condition: "sidingCondition", issues: "sidingIssues" },
  windows: { lastInspection: "windowLastInspection", nextInspection: "windowNextInspection", condition: "windowCondition", issues: "windowIssues" },
  heating: { lastInspection: "heatingLastInspection", nextInspection: "heatingNextInspection", condition: "heatingCondition", issues: "heatingIssues" },
  ac: { lastInspection: "acLastInspection", nextInspection: "acNextInspection", condition: "acCondition", issues: "acIssues" },
  waterHeating: { lastInspection: "waterHeatingLastInspection", nextInspection: "waterHeatingNextInspection", condition: "waterHeatingCondition", issues: "waterHeatingIssues" },
  electrical: { lastInspection: "electricalLastInspection", nextInspection: "electricalNextInspection", condition: "electricalCondition", issues: "electricalIssues" },
  plumbing: { lastInspection: "plumbingLastInspection", nextInspection: "plumbingNextInspection", condition: "plumbingCondition", issues: "plumbingIssues" },
};

function isFilled(value) {
  if (value == null) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

/**
 * Extract custom system name from sectionId (e.g. "custom-Solar Panel-0" -> "Solar Panel").
 */
function getCustomSystemName(systemType) {
  if (!systemType || !String(systemType).startsWith("custom-")) return null;
  const rest = String(systemType).slice(7); // after "custom-"
  const lastDash = rest.lastIndexOf("-");
  if (lastDash < 0) return rest;
  return rest.slice(0, lastDash);
}

/**
 * Check if a date string is in the future (or today).
 */
function isUpcomingDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d >= today;
}

/**
 * Compute status flags for a system.
 * @param {Object} propertyData - Property form data
 * @param {string} systemType - System ID (e.g. "roof", "custom-Solar-0")
 * @param {boolean} isNewInstall - Whether system is marked as new install
 * @param {Object} customSystemsData - Custom system data (for custom systems)
 * @returns {{ needsAttention: boolean, hasScheduledEvent: boolean }}
 */
export function getSystemStatus(propertyData, systemType, isNewInstall, customSystemsData = {}) {
  let lastInspection = null;
  let nextInspection = null;

  const customName = getCustomSystemName(systemType);
  let condition = null;
  let issues = null;

  if (customName) {
    const customData = customSystemsData[customName] ?? {};
    lastInspection = customData.lastInspection;
    nextInspection = customData.nextInspection;
    condition = customData.condition;
    issues = customData.issues;
  } else {
    const fields = INSPECTION_FIELDS_BY_SYSTEM[systemType];
    if (fields) {
      lastInspection = propertyData?.[fields.lastInspection];
      nextInspection = propertyData?.[fields.nextInspection];
      condition = propertyData?.[fields.condition];
      issues = propertyData?.[fields.issues];
    }
  }

  // Needs Attention: no inspection recorded (and not new install), OR requires maintenance (Poor/Fair condition or has known issues)
  const noInspectionRecorded = !isNewInstall && !isFilled(lastInspection);
  const requiresMaintenance = ["Poor", "Fair"].includes(condition) || isFilled(issues);
  const needsAttention = noInspectionRecorded || requiresMaintenance;

  // Scheduled Event: upcoming inspection or maintenance
  const hasScheduledEvent = isFilled(nextInspection) && isUpcomingDate(nextInspection);

  return { needsAttention, hasScheduledEvent };
}
