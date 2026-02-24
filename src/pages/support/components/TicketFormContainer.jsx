import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import ModalBlank from "../../../components/ModalBlank";
import StatusBadge, { SUPPORT_STATUS_LABELS, FEEDBACK_STATUS_LABELS } from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";

/** Support ticket categories */
export const SUPPORT_CATEGORIES = ["Bug", "Billing", "Technical", "Account", "Other"];

/** Map backend status to 4-column display */
const normalizeStatus = (s) => {
  if (["new", "in_progress", "completed", "closed"].includes(s)) return s;
  if (["solved", "resolved"].includes(s)) return "completed";
  if (["working_on_it", "waiting_on_user", "under_review", "planned"].includes(s)) return "in_progress";
  if (s === "rejected") return "closed";
  return s || "new";
};

/** Derive priority from tier for display when priority not set */
const tierToPriority = (tier) => {
  const t = (tier || "").toLowerCase();
  if (["premium", "win"].includes(t)) return "urgent";
  if (["pro", "maintain"].includes(t)) return "high";
  if (["agent", "basic"].includes(t)) return "medium";
  return "low";
};

/** SLA hours by plan tier (placeholder for future integration) */
const SLA_BY_TIER = {
  premium: 4,
  win: 4,
  pro: 8,
  maintain: 8,
  agent: 24,
  basic: 24,
  free: 48,
};

/**
 * Reusable ticket form container for support and feedback.
 * Renders as a modal with header, user panel, details, activity timeline, and response section.
 */
function TicketFormContainer({
  ticket,
  admins = [],
  variant = "support", // 'support' | 'feedback'
  onClose,
  onStatusChange,
  onAssign,
  onInternalNotes,
  onSendAndMarkInProgress,
  onSendAndResolve,
  onSaveInternalNote,
  onConvertToSupportTicket, // feedback only
  onRefresh,
  updating = false,
}) {
  const [internalNotes, setInternalNotes] = useState(ticket?.internalNotes || "");
  const [responseText, setResponseText] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);

  const labels = variant === "feedback" ? FEEDBACK_STATUS_LABELS : SUPPORT_STATUS_LABELS;
  const statusDisplay = normalizeStatus(ticket?.status);
  const statusForSelect = statusDisplay;
  const priority = ticket?.priority ?? tierToPriority(ticket?.subscriptionTier);
  const slaHours = SLA_BY_TIER[(ticket?.subscriptionTier || "free").toLowerCase()] ?? 48;

  useEffect(() => {
    setInternalNotes(ticket?.internalNotes || "");
    setNotesDirty(false);
  }, [ticket?.id, ticket?.internalNotes]);

  function handleSaveNotes() {
    if (!notesDirty) return;
    onInternalNotes?.(ticket.id, internalNotes);
    setNotesDirty(false);
  }

  // Build activity timeline: initial message + status/response history (extends when API provides activity)
  const createdAt = ticket?.createdAt ? new Date(ticket.createdAt) : null;
  const updatedAt = ticket?.updatedAt ? new Date(ticket.updatedAt) : null;
  const activityItems = [
    {
      type: "message",
      actor: ticket?.createdByName || ticket?.createdByEmail || "User",
      text: ticket?.description,
      timestamp: ticket?.createdAt,
      label: "Initial submission",
    },
    ...(ticket?.activity || []),
    ...(updatedAt && createdAt && updatedAt.getTime() > createdAt.getTime() + 60000
      ? [
          {
            type: "status",
            actor: "System",
            text: `Ticket updated`,
            timestamp: ticket?.updatedAt,
            label: "Last updated",
          },
        ]
      : []),
  ].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

  return (
    <ModalBlank id="ticket-form-modal" modalOpen={!!ticket} setModalOpen={onClose} contentClassName="max-w-3xl">
      <div className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">#{ticket?.id}</h2>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{ticket?.subject}</h2>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <StatusBadge status={statusDisplay} labels={labels} />
              {variant === "support" && <PriorityBadge priority={priority} />}
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created {ticket?.createdAt && format(new Date(ticket.createdAt), "MMM d, yyyy HH:mm")}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Updated {ticket?.updatedAt && format(new Date(ticket.updatedAt), "MMM d, yyyy HH:mm")}
              </span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Info Panel */}
          <section className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">User Info</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Name</span>
                <p className="font-medium text-gray-900 dark:text-white">{ticket?.createdByName || "—"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Email</span>
                <p className="font-medium text-gray-900 dark:text-white">{ticket?.createdByEmail || "—"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Role</span>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{ticket?.createdByRole || "Homeowner"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Payment Plan</span>
                <p className="font-medium text-gray-900 dark:text-white">{ticket?.subscriptionTier || "Free"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Account ID</span>
                <p className="font-medium text-gray-900 dark:text-white">{ticket?.accountId || "—"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Properties</span>
                <p className="font-medium text-gray-900 dark:text-white">{ticket?.propertyCount ?? "—"}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Est. MRR</span>
                <p className="font-medium text-gray-900 dark:text-white">{ticket?.estimatedMrr ?? "—"}</p>
              </div>
            </div>
            {/* SLA indicator */}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">SLA target: </span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{slaHours}h response</span>
            </div>
          </section>

          {/* Ticket Details */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Ticket Details</h3>
            <div className="space-y-3">
              {variant === "support" && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Category</label>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket?.category || "Other"}</p>
                </div>
              )}
              {variant === "feedback" && (
                <>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Feature Category</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket?.featureCategory || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Impact Estimate (admin)</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket?.impactEstimate ?? "—"}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Upvotes</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket?.upvoteCount ?? 0}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Roadmap Tag</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket?.roadmapTag || "—"}</p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400">Description</label>
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap mt-0.5">{ticket?.description || "—"}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400">Attachments</label>
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">(Placeholder — future integration)</p>
              </div>
            </div>
          </section>

          {/* Admin controls: Status, Assign, Escalation */}
          <section className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={statusForSelect}
                onChange={(e) => onStatusChange?.(ticket.id, e.target.value)}
                disabled={updating}
                className="form-select text-sm w-40"
              >
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assign to</label>
              <select
                value={ticket?.assignedTo || ""}
                onChange={(e) => onAssign?.(ticket.id, e.target.value ? Number(e.target.value) : null)}
                disabled={updating}
                className="form-select text-sm w-44"
              >
                <option value="">Unassigned</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>{a.name || a.email}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="escalated" className="form-checkbox" readOnly checked={ticket?.escalated} />
              <label htmlFor="escalated" className="text-sm text-gray-600 dark:text-gray-400">Escalated</label>
            </div>
            {variant === "feedback" && (
              <button
                type="button"
                onClick={onConvertToSupportTicket}
                className="btn border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm"
              >
                Convert to Support Ticket
              </button>
            )}
          </section>

          {/* Internal Notes (admin-only) */}
          <section>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Internal Notes</label>
            <textarea
              value={internalNotes}
              onChange={(e) => {
                setInternalNotes(e.target.value);
                setNotesDirty(true);
              }}
              className="form-input w-full min-h-[80px] text-sm"
              placeholder="Internal notes (not visible to user)"
            />
            {notesDirty && (
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={updating}
                className="mt-2 btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 text-sm"
              >
                {updating ? "Saving..." : "Save Internal Note"}
              </button>
            )}
          </section>

          {/* Activity / History Timeline */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Activity & History</h3>
            <div className="space-y-4">
              {activityItems.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {item.label && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {item.label}
                      </span>
                    )}
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{item.text}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.actor} · {item.timestamp && format(new Date(item.timestamp), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              ))}
              {activityItems.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No activity yet.</p>
              )}
            </div>
          </section>

          {/* Email Response Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Response</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Compose your reply to the user. Sending will update the ticket status.
            </p>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              className="form-input w-full min-h-[100px] text-sm"
              placeholder="Type your email response to the user..."
            />
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                type="button"
                onClick={() => onSendAndMarkInProgress?.(ticket.id, responseText)}
                disabled={updating}
                className="btn bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                Send & mark In Progress
              </button>
              <button
                type="button"
                onClick={() => onSendAndResolve?.(ticket.id, responseText)}
                disabled={updating}
                className="btn bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
              >
                Send & Resolve
              </button>
            </div>
          </section>
        </div>
      </div>
    </ModalBlank>
  );
}

export default TicketFormContainer;
