import React, {useState, useMemo} from "react";
import DonutChart from "../../partials/propertyFeatures/DonutChart";
import {
  Shield,
  Settings,
  Wrench,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  IDENTITY_SECTIONS,
  isSectionComplete,
} from "./constants/identitySections";
import {
  countCompletedSystemsWithCustom,
  isSystemComplete,
  isCustomSystemComplete,
} from "./constants/systemSections";
import {
  PROPERTY_SYSTEMS,
  DEFAULT_SYSTEM_IDS,
} from "./constants/propertySystems";

function ScoreCard({propertyData}) {
  const [scorecardOpen, setScorecardOpen] = useState(false);

  // Identity: compute completion from actual form sections
  const identitySections = IDENTITY_SECTIONS;
  const completedIdentitySections = useMemo(
    () => identitySections.filter((s) => isSectionComplete(propertyData, s)),
    [propertyData]
  );
  const identityScore = identitySections.length
    ? (completedIdentitySections.length / identitySections.length) * 100
    : 0;

  // Systems: derive completion from form data (same as Identity)
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
  const currentSystems = useMemo(
    () =>
      countCompletedSystemsWithCustom(
        propertyData,
        visibleSystemIds,
        customSystemNames
      ),
    [propertyData, visibleSystemIds, customSystemNames]
  );
  const systemsScore = systemItems.length
    ? (currentSystems / systemItems.length) * 100
    : 0;

  // Maintenance: show same systems as Systems section
  // TODO: Backend should return per-system maintenance completion
  const currentMaintenance =
    propertyData.healthMetrics?.maintenanceCompleted?.current ?? 0;
  const maintenanceScore = systemItems.length
    ? (currentMaintenance / systemItems.length) * 100
    : 0;

  const totalScore = (identityScore + systemsScore + maintenanceScore) / 3;

  return (
    <div className="relative rounded-xl bg-gradient-to-br from-slate-50 via-white to-slate-100/80 dark:from-slate-800/95 dark:via-gray-900 dark:to-slate-800/90 ring-1 ring-slate-200/60 dark:ring-slate-600/40 shadow-lg shadow-slate-300/40 dark:shadow-black/40 p-4 overflow-hidden">
      {/* Subtle top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-slate-400/60 to-transparent dark:via-slate-500/50" />

      {/* Home Passport Health Status header and summary */}
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
        Home Passport Health Status
      </h2>

      <div className="flex flex-col lg:flex-row gap-3 items-center lg:items-start">
        {/* Donut Chart */}
        <div className="flex-shrink-0">
          <DonutChart
            percentage={Math.round(totalScore)}
            size={96}
            strokeWidth={8}
          />
        </div>

        {/* Progress bars */}
        <div className="flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Identity */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Identity
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {completedIdentitySections.length}/{identitySections.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-400 dark:bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{width: `${identityScore}%`}}
                ></div>
              </div>
            </div>

            {/* Systems */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Systems
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {currentSystems}/{systemItems.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-400 dark:bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{width: `${systemsScore}%`}}
                ></div>
              </div>
            </div>

            {/* Maintenance */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  Maintenance
                </span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {currentMaintenance}/{systemItems.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-400 dark:bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{width: `${maintenanceScore}%`}}
                ></div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-2">
            <button
              className="btn text-white text-sm py-2 px-4 transition-colors"
              style={{backgroundColor: "#456654"}}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#3a5548";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#456654";
              }}
            >
              Complete Outstanding Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Scorecard details */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setScorecardOpen(!scorecardOpen)}
          className="flex items-center justify-between w-full mb-2 text-left"
        >
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Scorecard
          </h3>
          {scorecardOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
        {scorecardOpen && (
          <div className="space-y-6 pl-2">
            {/* Identity Scorecard */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    Identity
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(identityScore)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {completedIdentitySections.length}/{identitySections.length}
                  </div>
                </div>
              </div>

              {/* Mini Donut Chart */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex-shrink-0">
                  <DonutChart
                    percentage={Math.round(identityScore)}
                    size={80}
                    strokeWidth={8}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Complete
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {completedIdentitySections.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${identityScore}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Incomplete
                    </span>
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {identitySections.length -
                        completedIdentitySections.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${100 - identityScore}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Identity Sections Checklist */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {identitySections.map((section) => {
                    const isCompleted = isSectionComplete(
                      propertyData,
                      section
                    );
                    return (
                      <div
                        key={section.id}
                        className="flex items-center gap-2 py-1"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                        )}
                        <span
                          className={
                            isCompleted
                              ? "text-gray-700 dark:text-gray-300 line-through"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {section.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Systems Scorecard */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    Systems
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(systemsScore)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentSystems}/{systemItems.length}
                  </div>
                </div>
              </div>

              {/* Mini Donut Chart */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex-shrink-0">
                  <DonutChart
                    percentage={Math.round(systemsScore)}
                    size={80}
                    strokeWidth={8}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Identified
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {currentSystems}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${systemsScore}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Missing
                    </span>
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {systemItems.length - currentSystems}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${100 - systemsScore}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Systems List - shows selected systems */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {systemItems.map((system) => {
                    const predefinedSystem = PROPERTY_SYSTEMS.find(
                      (s) => s.id === system.id
                    );
                    const Icon = predefinedSystem?.icon || Settings;
                    const isIdentified = predefinedSystem
                      ? isSystemComplete(propertyData, system.id)
                      : isCustomSystemComplete(
                          propertyData.customSystemsData ?? {},
                          system.name
                        );
                    return (
                      <div
                        key={system.id}
                        className="flex items-center gap-2 py-1"
                      >
                        {isIdentified ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                        )}
                        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span
                          className={
                            isIdentified
                              ? "text-gray-700 dark:text-gray-300 line-through"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {system.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Maintenance Scorecard */}
            <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">
                    Maintenance
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(maintenanceScore)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {currentMaintenance}/{systemItems.length}
                  </div>
                </div>
              </div>

              {/* Mini Donut Chart */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex-shrink-0">
                  <DonutChart
                    percentage={Math.round(maintenanceScore)}
                    size={80}
                    strokeWidth={8}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Complete
                    </span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {currentMaintenance}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${maintenanceScore}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Incomplete
                    </span>
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {systemItems.length - currentMaintenance}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${100 - maintenanceScore}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Maintenance Checklist - same systems as Systems section */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {systemItems.map((system, idx) => {
                    const predefinedSystem = PROPERTY_SYSTEMS.find(
                      (s) => s.id === system.id
                    );
                    const Icon = predefinedSystem?.icon || Settings;
                    // TODO: Backend should return per-system maintenance completion; for now use index
                    const isComplete = idx < currentMaintenance;
                    return (
                      <div
                        key={system.id}
                        className="flex items-center gap-2 py-1"
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                        )}
                        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span
                          className={
                            isComplete
                              ? "text-gray-700 dark:text-gray-300 line-through"
                              : "text-gray-500 dark:text-gray-400"
                          }
                        >
                          {system.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreCard;
