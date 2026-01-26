import React, {useState} from "react";
import DonutChart from "../../partials/propertyFeatures/DonutChart";
import Tooltip from "../../utils/Tooltip";
import {
  Shield,
  Settings,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Building,
  Zap,
  Droplet,
  Home,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";

// Import default items from HealthMetrics
const defaultIdentity = [
  {id: 1, name: "Inspection Report", description: "Essential for identifying property condition, potential issues, and establishing baseline for maintenance planning"},
  {id: 2, name: "Insurance Policy", description: "Critical for protection against damages and required for mortgage compliance"},
  {id: 3, name: "Warranty Documents", description: "Important for coverage verification and warranty claims, saving significant repair costs"},
  {id: 4, name: "Permits & Certificates", description: "Required for legal compliance, ensuring all work meets building codes and regulations"},
  {id: 5, name: "Tax Records", description: "Essential for tax filing, property value assessment, and financial planning"},
  {id: 6, name: "HOA Documents", description: "Required to understand rules, fees, and responsibilities within the homeowners association"},
  {id: 7, name: "Utility Bills", description: "Important for tracking usage patterns, identifying inefficiencies, and budgeting"},
  {id: 8, name: "Maintenance Records", description: "Critical for tracking service history, warranty claims, and maintaining property value"},
  {id: 9, name: "Appraisal Report", description: "Essential for accurate property valuation, insurance, and refinancing decisions"},
  {id: 10, name: "Title Documents", description: "Critical for proving ownership and required for all property transactions"},
];

const defaultSystems = [
  {id: 1, name: "Roof", description: "Critical system that protects the entire property - regular identification ensures proper maintenance and prevents costly water damage"},
  {id: 2, name: "HVAC", description: "Essential for comfort and air quality - proper identification enables efficient maintenance and reduces energy costs"},
  {id: 3, name: "Plumbing", description: "Vital system that requires regular monitoring - identifying all components prevents leaks and water damage"},
  {id: 4, name: "Electrical", description: "Safety-critical system - complete identification ensures code compliance and prevents fire hazards"},
  {id: 5, name: "Foundation", description: "Structural integrity depends on this - identifying issues early prevents expensive repairs and property devaluation"},
  {id: 6, name: "Windows", description: "Important for energy efficiency and security - proper identification enables weatherization and maintenance planning"},
];

const defaultMaintenance = [
  {id: 1, name: "Schedule Setup", description: "Essential for proactive maintenance - prevents costly emergency repairs and extends system lifespan"},
  {id: 2, name: "Define Maintenance Tasks", description: "Critical for consistent care - ensures all systems receive proper attention at the right intervals"},
  {id: 3, name: "Set Reminder Intervals", description: "Important for maintaining schedules - prevents missed maintenance that leads to system failures"},
  {id: 4, name: "Configure Notifications", description: "Vital for staying on track - timely reminders ensure maintenance tasks are never overlooked"},
];

// Icon mapping for systems
const systemIcons = {
  "Roof": Building,
  "HVAC": Zap,
  "Plumbing": Droplet,
  "Electrical": Zap,
  "Foundation": Building,
  "Windows": Home,
};

function ScoreCard({propertyData}) {
  const [scorecardOpen, setScorecardOpen] = useState(false);

  // Get the items for each section (in a real app, this would come from an API/context)
  // For now, using the defaults from HealthMetrics
  const identity = defaultIdentity;
  const systems = defaultSystems;
  const maintenance = defaultMaintenance;

  // Get identity items up to the total specified
  // (metric key is currently `documentsUploaded` in `propertyData.healthMetrics`)
  const identityItems = identity.slice(0, propertyData.healthMetrics?.documentsUploaded.total || 10);
  const currentIdentity = propertyData.healthMetrics?.documentsUploaded.current || 8;

  // Get system items up to the total specified
  const systemItems = systems.slice(0, propertyData.healthMetrics?.systemsIdentified.total || 6);
  const currentSystems = propertyData.healthMetrics?.systemsIdentified.current || 3;

  // Get maintenance items
  const maintenanceItems = maintenance;
  const isMaintenanceComplete = propertyData.healthMetrics?.maintenanceProfileSetup.complete;

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setScorecardOpen(!scorecardOpen)}
        className="flex items-center justify-between w-full mb-4 text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
                  {Math.round((currentIdentity / identityItems.length) * 100)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {currentIdentity}/{identityItems.length}
                </div>
              </div>
            </div>

            {/* Mini Donut Chart */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex-shrink-0">
                <DonutChart
                  percentage={Math.round((currentIdentity / identityItems.length) * 100)}
                  size={80}
                  strokeWidth={8}
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Verified
                  </span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {currentIdentity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${(currentIdentity / identityItems.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Missing
                  </span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {identityItems.length - currentIdentity}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 dark:bg-orange-400 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${((identityItems.length - currentIdentity) / identityItems.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Identity Checklist */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {identityItems.map((doc, idx) => {
                  const isCompleted = idx < currentIdentity;
                  return (
                    <div key={doc.id} className="flex items-center gap-2 py-1">
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
                        {doc.name}
                      </span>
                      <Tooltip
                        content={doc.description}
                        bg="dark"
                        size="xl"
                        position="right"
                        className=""
                      >
                        <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 cursor-help" />
                      </Tooltip>
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
                  {Math.round((currentSystems / systemItems.length) * 100)}%
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
                  percentage={Math.round((currentSystems / systemItems.length) * 100)}
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
                      width: `${(currentSystems / systemItems.length) * 100}%`,
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
                      width: `${((systemItems.length - currentSystems) / systemItems.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Systems List */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {systemItems.map((system, idx) => {
                  const Icon = systemIcons[system.name] || Building;
                  const isIdentified = idx < currentSystems;
                  return (
                    <div key={system.id} className="flex items-center gap-2 py-1">
                      {isIdentified ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                      )}
                      <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span
                        className={
                          isIdentified
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      >
                        {system.name}
                      </span>
                      <Tooltip
                        content={system.description}
                        bg="dark"
                        size="xl"
                        position="right"
                        className=""
                      >
                        <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 cursor-help" />
                      </Tooltip>
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
                  {isMaintenanceComplete ? "100%" : "0%"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {isMaintenanceComplete ? "Complete" : "Incomplete"}
                </div>
              </div>
            </div>

            {/* Mini Donut Chart */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex-shrink-0">
                <DonutChart
                  percentage={isMaintenanceComplete ? 100 : 0}
                  size={80}
                  strokeWidth={8}
                />
              </div>
              <div className="flex-1 space-y-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      isMaintenanceComplete
                        ? "bg-green-500 dark:bg-green-400"
                        : "bg-orange-500 dark:bg-orange-400"
                    }`}
                    style={{
                      width: `${isMaintenanceComplete ? 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="flex items-center gap-2">
                  {isMaintenanceComplete ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-green-500 dark:text-green-400" />
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        Profile Configured
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        Setup Required
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Maintenance Checklist */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2 text-sm">
                {maintenanceItems.map((task, idx) => {
                  const isComplete = isMaintenanceComplete && idx < 4;
                  return (
                    <div key={task.id} className="flex items-center gap-2 py-1">
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"></div>
                      )}
                      <span
                        className={
                          isComplete
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      >
                        {task.name}
                      </span>
                      <Tooltip
                        content={task.description}
                        bg="dark"
                        size="xl"
                        position="right"
                        className=""
                      >
                        <Info className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0 cursor-help" />
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreCard;
