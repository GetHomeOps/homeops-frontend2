import React, {useMemo} from "react";
import {ChevronDown, ChevronRight, Check, AlertTriangle, Calendar, Sparkles} from "lucide-react";
import SystemActionButtons from "./SystemActionButtons";
import Tooltip from "../../../utils/Tooltip";
import {getSystemStatus} from "../helpers/systemStatusHelpers";

/**
 * Collapsible Section Component with Progress Bar and Action Buttons
 * Used in SystemsTab for expandable system sections
 */
function CollapsibleSection({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  showActionButtons = false,
  installerId,
  installerName,
  systemType,
  systemLabel,
  contacts = [],
  isNewInstall = false,
  onNewInstallChange,
  onScheduleInspection,
  progress = {filled: 0, total: 0, percent: 0},
  propertyId,
  propertyData = {},
  systemsToShow = [],
  customSystemsData = {},
  onOpenAIAssistant,
}) {
  const {needsAttention, hasScheduledEvent} = useMemo(
    () =>
      showActionButtons
        ? getSystemStatus(propertyData, systemType, isNewInstall, customSystemsData)
        : {needsAttention: false, hasScheduledEvent: false},
    [showActionButtons, propertyData, systemType, isNewInstall, customSystemsData],
  );
  const isComplete = progress.percent >= 100;

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-sm relative">
      <style>{`
        @keyframes systemCheckPop {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .scrollbar-sleek {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        .dark .scrollbar-sleek {
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
        .scrollbar-sleek::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-sleek::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-sleek::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .scrollbar-sleek::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .dark .scrollbar-sleek::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .dark .scrollbar-sleek::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      {/* Progress bar - compresses when complete */}
      <div
        className="absolute top-0 left-0 right-0 bg-gray-200 dark:bg-gray-600 rounded-t-lg overflow-hidden"
        style={{
          height: isComplete ? 0 : 3,
          opacity: isComplete ? 0 : 1,
          transition: "height 0.35s ease-out, opacity 0.25s ease-out",
        }}
      >
        <div
          className="h-full bg-emerald-400 dark:bg-emerald-400/90 transition-all duration-500 ease-out"
          style={{width: `${progress.percent}%`}}
        />
      </div>

      {/* Header - full bar clickable to toggle (use div to avoid button-inside-button) */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group text-left"
      >
        {/* Left side: Title and Action Buttons */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Title section */}
          <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
            {Icon && (
              <Icon
                className="h-4 w-4 flex-shrink-0"
                style={{color: "#456654"}}
              />
            )}
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
              {title}
            </h3>
            {!isComplete && progress.total > 0 && (
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                ({progress.filled}/{progress.total})
              </span>
            )}
          </div>

          {/* Action Buttons - stop propagation so they don't toggle; scroll horizontally on small screens */}
          {showActionButtons && (
            <div
              className="scrollbar-sleek min-w-0 overflow-x-auto overflow-y-hidden flex-shrink"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <SystemActionButtons
                systemType={systemType}
                systemLabel={systemLabel || title}
                installerId={installerId}
                installerName={installerName}
                contacts={contacts}
                isNewInstall={isNewInstall}
                onNewInstallChange={onNewInstallChange}
                onScheduleInspection={onScheduleInspection}
                propertyId={propertyId}
                propertyData={propertyData}
                systemsToShow={systemsToShow}
              />
            </div>
          )}

          {/* Status Icons - Needs Attention, Scheduled Event, AI Assistant */}
          {showActionButtons && (
            <div
              className="flex items-center gap-1.5 flex-shrink-0 ml-1"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {needsAttention && (
                <Tooltip content="Needs attention" position="bottom">
                  <span className="inline-flex items-center justify-center w-[18px] h-[18px] text-amber-600 dark:text-amber-500/90 hover:text-amber-700 dark:hover:text-amber-400 transition-colors cursor-default">
                    <AlertTriangle className="w-[18px] h-[18px]" strokeWidth={2} />
                  </span>
                </Tooltip>
              )}
              {hasScheduledEvent && (
                <Tooltip content="Scheduled event" position="bottom">
                  <span className="inline-flex items-center justify-center w-[18px] h-[18px] text-emerald-600 dark:text-emerald-500/90 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-default">
                    <Calendar className="w-[18px] h-[18px]" strokeWidth={2} />
                  </span>
                </Tooltip>
              )}
              {onOpenAIAssistant && (
                <Tooltip content="AI Assistant" position="bottom">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAIAssistant(systemLabel || title);
                    }}
                    className="inline-flex items-center justify-center w-[18px] h-[18px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-600/50 p-0.5"
                    aria-label="Open AI Assistant"
                  >
                    <Sparkles className="w-[18px] h-[18px]" strokeWidth={2} />
                  </button>
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {/* Right side: Checkmark and Chevron */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isComplete && (
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-400/20 dark:bg-emerald-400/25 text-emerald-600 dark:text-emerald-400"
              style={{
                animation:
                  "systemCheckPop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
              }}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2.25} />
            </div>
          )}
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
          )}
        </div>
      </div>

      {/* Form fields - Only visible when expanded */}
      {isOpen && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}

export default CollapsibleSection;
