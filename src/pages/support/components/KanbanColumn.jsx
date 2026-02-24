import React from "react";

/**
 * Odoo-style Kanban column: borderless, clean, minimal.
 * No visible borders on the drop zone.
 */
function KanbanColumn({
  title,
  count,
  children,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}) {
  return (
    <div
      className={`flex-shrink-0 w-[280px] min-h-[320px] rounded-lg transition-colors duration-150 ${
        isDragOver ? "bg-violet-50/80 dark:bg-violet-950/30" : "bg-gray-50/50 dark:bg-gray-800/30"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-700/60 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="px-2 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-320px)]">{children}</div>
    </div>
  );
}

export default KanbanColumn;
