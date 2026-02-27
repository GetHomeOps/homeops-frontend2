/**
 * InspectionAnalysisModalContent
 * Renders inspection report AI analysis inside a modal.
 * Uses useInspectionAnalysis for fetch logic.
 * Includes per-system scheduling like AIFindingsPanel in the setup modal.
 */

import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, AlertCircle, Calendar, ExternalLink } from "lucide-react";
import { useInspectionAnalysis } from "../../../hooks/useInspectionAnalysis";
import { PROPERTY_SYSTEMS } from "../constants/propertySystems";

const CONDITION_BADGES = {
  excellent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  good: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  fair: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  poor: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  unknown: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const PRIORITY_BADGES = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  low: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

function formatCondition(str) {
  if (!str || typeof str !== "string") return "Not specified";
  const lower = str.toLowerCase();
  if (lower === "unknown") return "Not specified";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatConfidence(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `${Math.round(n * 100)}%`;
}

function getSystemLabel(systemKey) {
  if (!systemKey) return "Maintenance";
  const sys = PROPERTY_SYSTEMS.find((s) => s.id === systemKey);
  return sys?.name || systemKey;
}

export default function InspectionAnalysisModalContent({
  propertyId,
  isOpen,
  onScheduleMaintenance,
}) {
  const navigate = useNavigate();
  const { accountUrl } = useParams();
  const professionalsPath = accountUrl ? `/${accountUrl}/professionals` : "/professionals";
  const { status, data, error, generate, refresh, load } =
    useInspectionAnalysis(propertyId);

  useEffect(() => {
    if (isOpen && propertyId) {
      load();
    }
  }, [isOpen, propertyId, load]);

  if (!propertyId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Select or create a property to view analysis.
        </p>
      </div>
    );
  }

  if (status === "idle" || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 mt-6" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-4/5" />
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-6 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing report…
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 dark:text-amber-400 mb-3" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Something went wrong
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
          {error}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#456564] hover:bg-[#34514f] text-white text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <AlertCircle className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          No analysis available yet.
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mb-4">
          Upload an inspection report in the Documents tab, then generate analysis.
        </p>
        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#456564] hover:bg-[#34514f] text-white text-sm font-medium"
        >
          Generate Analysis
        </button>
      </div>
    );
  }

  if (status === "ready" && data) {
    const condition = data.property_state ?? data.conditionRating ?? "unknown";
    const conditionClass = CONDITION_BADGES[condition] ?? CONDITION_BADGES.unknown;
    const systems = data.systems_detected ?? data.systemsDetected ?? [];
    // Support both recommended_actions (normalized) and maintenanceSuggestions (raw API)
    const rawActions = data.recommended_actions ?? data.maintenanceSuggestions ?? data.maintenance_suggestions ?? [];
    const actions = rawActions.map((a) => {
      const item = typeof a === "object" ? a : { title: a };
      const sysType = item.systemType ?? item.system_type ?? item.category ?? "general";
      return {
        task: item.task ?? item.title ?? getSystemLabel(sysType),
        systemType: sysType,
        suggestedWhen: item.suggestedWhen ?? item.suggested_schedule_window ?? "",
        rationale: item.rationale ?? item.reason ?? "",
        priority: item.priority ?? "medium",
      };
    });

    return (
      <div className="p-6 space-y-6">
        {/* Summary */}
        <section>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
            Summary
          </h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {data.summary || "No summary available."}
          </p>
        </section>

        {/* Property Condition */}
        <section>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
            Property Condition
          </h3>
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${conditionClass}`}
          >
            {formatCondition(condition)}
          </span>
        </section>

        {/* Systems Detected */}
        <section>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            Systems Detected
          </h3>
          {systems.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No systems detected.
            </p>
          ) : (
            <ul className="space-y-2">
              {systems.map((s, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50"
                >
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {s.name ?? "—"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded capitalize ${
                        CONDITION_BADGES[s.condition] ?? CONDITION_BADGES.unknown
                      }`}
                    >
                      {formatCondition(s.condition)}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                      {formatConfidence(s.confidence)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recommended Actions */}
        <section>
          <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
            Recommended Actions
          </h3>
          {actions.length === 0 ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No recommended actions.
            </p>
          ) : (
            <ul className="space-y-2">
              {actions.map((a, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium capitalize ${
                          PRIORITY_BADGES[a.priority] ?? PRIORITY_BADGES.medium
                        }`}
                      >
                        {formatCondition(a.priority)}
                      </span>
                      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {a.task}
                      </p>
                    </div>
                    {(a.suggestedWhen || a.rationale) && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {[a.suggestedWhen, a.rationale].filter(Boolean).join(" — ")}
                      </p>
                    )}
                  </div>
                  {onScheduleMaintenance && (
                    <div className="flex-shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onScheduleMaintenance({
                            systemType: a.systemType,
                            systemLabel: getSystemLabel(a.systemType),
                            task: a.task,
                            suggestedWhen: a.suggestedWhen,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-[#456564]/10 hover:bg-[#456564]/20 text-[#456564] dark:text-[#7aa3a2] transition-colors"
                      >
                        <Calendar className="w-3 h-3" />
                        Schedule
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(professionalsPath)}
                        className="inline-flex items-center gap-0.5 text-[11px] text-neutral-500 hover:text-[#456564] dark:text-neutral-400 dark:hover:text-[#7aa3a2] transition-colors"
                      >
                        Professionals
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  return null;
}
