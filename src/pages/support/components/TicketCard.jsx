import React, { useRef } from "react";
import { format } from "date-fns";
import StatusBadge, { SUPPORT_STATUS_LABELS, FEEDBACK_STATUS_LABELS } from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

/**
 * Reusable ticket card for Kanban columns.
 * Supports both support and feedback ticket types.
 * Entire card is draggable with visual feedback (shadow/elevation) during drag.
 * Click opens the detail panel (ignored when user was dragging).
 */
function TicketCard({
  ticket,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
  variant = "support", // 'support' | 'feedback'
}) {
  const didDragRef = useRef(false);
  const labels = variant === "feedback" ? FEEDBACK_STATUS_LABELS : SUPPORT_STATUS_LABELS;
  const typeBadgeClass =
    ticket.type === "feedback"
      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300"
      : "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300";

  const tierBadgeClass = "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300";

  function handleDragStart(e) {
    didDragRef.current = true;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(ticket.id));
    onDragStart?.(e, ticket);
  }

  function handleDragEnd(e) {
    onDragEnd?.(e);
    setTimeout(() => { didDragRef.current = false; }, 0);
  }

  function handleOpenDetail(e) {
    if (didDragRef.current) return;
    e.stopPropagation();
    onClick?.();
  }

  return (
    <div
      className="cursor-pointer"
      onClick={handleOpenDetail}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 dark:hover:border-gray-600 transition-all select-none touch-none ${
          isDragging
            ? "opacity-90 scale-[1.02] shadow-xl ring-2 ring-violet-400/50 dark:ring-violet-500/50 z-50"
            : "shadow-sm hover:shadow-md"
        }`}
      >
        <div className="min-w-0">
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
    </div>
  );
}

export default TicketCard;
