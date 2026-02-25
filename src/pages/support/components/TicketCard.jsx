import React from "react";
import { format } from "date-fns";
import { GripVertical } from "lucide-react";
import StatusBadge, {
  SUPPORT_STATUS_LABELS,
  FEEDBACK_STATUS_LABELS,
} from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

/**
 * Odoo-style Kanban card:
 * - Click anywhere on the card → opens ticket detail
 * - Grab the handle (left side) and drag → moves between columns
 *
 * The drag handle is the only draggable element, so click and drag never conflict.
 */
function TicketCard({
  ticket,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
  variant = "support",
}) {
  const labels =
    variant === "feedback" ? FEEDBACK_STATUS_LABELS : SUPPORT_STATUS_LABELS;
  const typeBadgeClass =
    ticket.type === "feedback"
      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300"
      : "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300";
  const tierBadgeClass =
    "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300";

  function handleDragStart(e) {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(ticket.id));
    onDragStart?.(e, ticket);
  }

  return (
    <div
      className={`flex gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 transition-all select-none ${
        isDragging
          ? "opacity-90 scale-[1.02] shadow-xl ring-2 ring-violet-400/50 dark:ring-violet-500/50 z-50"
          : "shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      {/* Drag handle: only this part is draggable; click also opens detail */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={(e) => onDragEnd?.(e)}
        onClick={() => onClick?.()}
        className="flex-shrink-0 self-start mt-0.5 p-1 -ml-1 rounded cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 touch-none"
        title="Drag to move between columns"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Card body: clickable, opens detail */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onClick?.()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium capitalize ${typeBadgeClass}`}
          >
            {ticket.type || variant}
          </span>
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium capitalize ${tierBadgeClass}`}
          >
            {ticket.subscriptionTier || "Free"}
          </span>
          {ticket.priority && variant === "support" && (
            <PriorityBadge priority={ticket.priority} />
          )}
        </div>
        <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
          {ticket.subject}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {ticket.createdByName || ticket.createdByEmail}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {ticket.accountName}
        </p>
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
