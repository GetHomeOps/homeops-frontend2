import React from "react";
import {X, Sparkles} from "lucide-react";
import Transition from "../../../utils/Transition";

/**
 * Right-side AI Assistant sidebar panel (UI placeholder).
 * Opens when user clicks the AI icon on a system header.
 */
function AIAssistantSidebar({isOpen, onClose, systemLabel}) {
  return (
    <Transition
      show={isOpen}
      tag="div"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl"
      enter="transition ease-out duration-200 transform"
      enterStart="translate-x-full"
      enterEnd="translate-x-0"
      leave="transition ease-in duration-150 transform"
      leaveStart="translate-x-0"
      leaveEnd="translate-x-full"
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
              AI Assistant
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {systemLabel && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Context: <span className="font-medium text-gray-800 dark:text-gray-200">{systemLabel}</span>
            </p>
          )}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 p-6 text-center">
            <Sparkles className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI Assistant coming soon…
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Get insights and recommendations for this system.
            </p>
          </div>
        </div>
      </div>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-[-1] md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
    </Transition>
  );
}

export default AIAssistantSidebar;
