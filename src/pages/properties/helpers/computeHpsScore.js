/**
 * Computes the Home Passport Health Status (HPS) score from property form data.
 * Uses the same logic as ScoreCard: average of identity, systems, and maintenance completion.
 * @param {Object} propertyData - Merged form data (identity + systems + maintenance)
 * @returns {number} Integer 0-100
 */
import { IDENTITY_SECTIONS, isSectionComplete } from "../constants/identitySections";
import {
  countCompletedSystemsWithCustom,
} from "../constants/systemSections";
import { PROPERTY_SYSTEMS, DEFAULT_SYSTEM_IDS } from "../constants/propertySystems";

export function computeHpsScore(propertyData) {
  if (!propertyData || typeof propertyData !== "object") return 0;

  // Identity score
  const identitySections = IDENTITY_SECTIONS;
  const completedIdentitySections = identitySections.filter((s) =>
    isSectionComplete(propertyData, s)
  );
  const identityScore = identitySections.length
    ? (completedIdentitySections.length / identitySections.length) * 100
    : 0;

  // Systems score
  const visibleSystemIds =
    (propertyData.selectedSystemIds?.length ?? 0) > 0
      ? propertyData.selectedSystemIds
      : DEFAULT_SYSTEM_IDS;
  const customSystemNames = propertyData.customSystemNames ?? [];
  const systemItems = [
    ...PROPERTY_SYSTEMS.filter((s) => visibleSystemIds.includes(s.id)),
    ...customSystemNames.map((name, index) => ({
      id: `custom-${name}-${index}`,
      name,
    })),
  ];
  const currentSystems = countCompletedSystemsWithCustom(
    propertyData,
    visibleSystemIds,
    customSystemNames
  );
  const systemsScore = systemItems.length
    ? (currentSystems / systemItems.length) * 100
    : 0;

  // Maintenance score (same as ScoreCard)
  const currentMaintenance =
    propertyData.healthMetrics?.maintenanceCompleted?.current ?? 0;
  const maintenanceScore = systemItems.length
    ? (currentMaintenance / systemItems.length) * 100
    : 0;

  const totalScore = (identityScore + systemsScore + maintenanceScore) / 3;
  return Math.round(Math.max(0, Math.min(100, totalScore)));
}
