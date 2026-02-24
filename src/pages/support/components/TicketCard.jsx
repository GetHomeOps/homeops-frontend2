import React, { useRef, useCallback } from "react";
import { format } from "date-fns";
import StatusBadge, { SUPPORT_STATUS_LABELS, FEEDBACK_STATUS_LABELS } from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

const DRAG_HOLD_MS = 180;
const MOVE_THRESHOLD = 5;

/**
 * Odoo-style Kanban card: click opens detail, hold + drag moves between columns.
 *
 * How it works:
 * - mousedown: record position/time, start a hold timer
 * - Hold timer fires (180ms): set dragAllowed = true
 * - Quick release (<180ms): dragstart is prevented → mouseup fires → treated as click → opens detail
 * - Held + moved: drag proceeds normally via HTML5 DnD
 */
function TicketCard({
  ticket,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
  variant = "support",
}) {
  const dragAllowedRef = useRef(false);
  const didDragRef = useRef(false);
  const holdTimerRef = useRef(null);
  const mouseOriginRef = useRef(null);

  const labels = variant === "feedback" ? FEEDBACK_STATUS_LABELS : SUPPORT_STATUS_LABELS;
  const typeBadgeClass =
    ticket.type === "feedback"
      ? "bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300"
      : "bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-300";
  const tierBadgeClass = "bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300";

  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0) return;
    mouseOriginRef.current = { x: e.clientX, y: e.clientY };
    dragAllowedRef.current = false;
    didDragRef.current = false;
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(() => {
      dragAllowedRef.current = true;
    }, DRAG_HOLD_MS);
  }, []);

  const handlePointerUp = useCallback(
    (e) => {
      clearTimeout(holdTimerRef.current);
      if (didDragRef.current) {
        didDragRef.current = false;
        return;
      }
      if (mouseOriginRef.current) {
        const dx = Math.abs(e.clientX - mouseOriginRef.current.x);
        const dy = Math.abs(e.clientY - mouseOriginRef.current.y);
        if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) return;
      }
      onClick?.();
    },
    [onClick]
  );

  const handleDragStart = useCallback(
    (e) => {
      if (!dragAllowedRef.current) {
        e.preventDefault();
        return;
      }
      didDragRef.current = true;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(ticket.id));
      onDragStart?.(e, ticket);
    },
    [ticket, onDragStart]
  );

  const handleDragEnd = useCallback(
    (e) => {
      dragAllowedRef.current = false;
      didDragRef.current = false;
      clearTimeout(holdTimerRef.current);
      onDragEnd?.(e);
    },
    [onDragEnd]
  );

  const handleClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      draggable
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-all select-none ${
        isDragging
          ? "opacity-90 scale-[1.02] shadow-xl ring-2 ring-violet-400/50 dark:ring-violet-500/50 z-50 cursor-grabbing"
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
  );
}

export default TicketCard;
