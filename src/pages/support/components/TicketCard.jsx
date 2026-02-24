import React from "react";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";
import StatusBadge, { SUPPORT_STATUS_LABELS, FEEDBACK_STATUS_LABELS } from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

/**
 * Reusable ticket card for Kanban columns.
 * Supports both support and feedback ticket types.
 * Uses a drag handle so the card body remains clickable to open the detail modal.
 */
function TicketCard({
  ticket,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
  variant = "support", // 'support' | 'feedback'
}) {
  const labels = variant === "feedback" ? FEEDBACK_STATUS_LABELS : SUPPORT_STATUS_LABELS;
  const typeBadgeClass =
    ticket.type === "feedback"
      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300"
      : "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300";

  const tierBadgeClass = "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300";

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all flex gap-2 ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      {/* Drag handle - prevents click from opening modal when user intends to drag */}
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-0.5"
        title="Drag to move"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium capitalize ${typeBadgeClass}`}>
          {ticket.type || variant}
        </span>
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium capitalize ${tierBadgeClass}`}>
          {ticket.subscriptionTier || "Free"}
        </span>
        {ticket.priority && variant === "support" && (
          <PriorityBadge priority={ticket.priority} />
        )}
      </div>
      <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{ticket.subject}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{ticket.createdByName || ticket.createdByEmail}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.accountName}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
      </p>
      <div className="mt-2">
        <StatusBadge status={ticket.status} labels={labels} />
      </div>
      </div>
    </div>
  );
}

export default TicketCard;
