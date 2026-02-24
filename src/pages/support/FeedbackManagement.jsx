import React, { useState, useEffect, useCallback, useMemo } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import AppApi from "../../api/api";
import { TicketCard, TicketFormContainer, KanbanColumn, FilterDropdownWithPills } from "./components";
import {PAGE_LAYOUT} from "../../constants/layout";

const COLUMNS = [
  { id: "new", title: "New", status: "new" },
  { id: "in_progress", title: "In Progress", status: "under_review" },
  { id: "completed", title: "Completed", status: "implemented" },
  { id: "closed", title: "Closed", status: "rejected" },
];

/** Map backend status to column */
const toColumnStatus = (s) => {
  if (s === "new") return "new";
  if (["under_review", "planned", "working_on_it"].includes(s)) return "in_progress";
  if (s === "implemented") return "completed";
  if (s === "rejected") return "closed";
  return "new";
};

/** Map column to backend status */
const toBackendStatus = (colId) => COLUMNS.find((c) => c.id === colId)?.status ?? "new";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
];

function FeedbackManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [sortBy, setSortBy] = useState("newest");

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const list = await AppApi.getAllSupportTickets();
      setTickets(list || []);
    } catch (err) {
      setError(err.message || "Failed to load feedback");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const list = await AppApi.getSupportAssignmentAdmins();
        setAdmins(list || []);
      } catch {
        setAdmins([]);
      }
    }
    fetchAdmins();
  }, []);

  const planTiers = useMemo(() => {
    const set = new Set();
    (tickets || [])
      .filter((t) => t.type === "feedback")
      .forEach((t) => set.add((t.subscriptionTier || "Free").toLowerCase()));
    return Array.from(set).sort();
  }, [tickets]);

  const filterCategories = useMemo(
    () => [
      { type: "status", label: "Status" },
      { type: "planTier", label: "Plan" },
    ],
    []
  );

  const filterOptions = useMemo(
    () => ({
      status: COLUMNS.map((c) => ({ value: c.id, label: c.title })),
      planTier: planTiers.map((t) => ({ value: t, label: t })),
    }),
    [planTiers]
  );

  const filteredTickets = useMemo(() => {
    let list = (tickets || []).filter((t) => t.type === "feedback");
    const byType = {};
    activeFilters.forEach((f) => {
      if (!byType[f.type]) byType[f.type] = [];
      byType[f.type].push(f.value);
    });
    if (byType.status?.length) {
      list = list.filter((t) => byType.status.includes(toColumnStatus(t.status)));
    }
    if (byType.planTier?.length) {
      list = list.filter((t) => byType.planTier.includes((t.subscriptionTier || "free").toLowerCase()));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          (t.subject || "").toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q) ||
          (t.createdByName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, activeFilters, searchQuery]);

  const ticketsByColumn = useMemo(() => {
    const acc = {};
    COLUMNS.forEach((col) => {
      let colTickets = filteredTickets.filter((t) => toColumnStatus(t.status) === col.id);
      if (sortBy === "oldest") colTickets.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      else colTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      acc[col.id] = colTickets;
    });
    return acc;
  }, [filteredTickets, sortBy]);

  function addFilter(f) {
    if (activeFilters.some((x) => x.type === f.type && x.value === f.value)) return;
    setActiveFilters((prev) => [...prev, f]);
  }

  function removeFilter(f) {
    setActiveFilters((prev) => prev.filter((x) => !(x.type === f.type && x.value === f.value)));
  }

  function clearFilters() {
    setActiveFilters([]);
    setSearchQuery("");
  }

  async function handleStatusChange(ticketId, newStatus) {
    const backendStatus = toBackendStatus(newStatus);
    setUpdating(true);
    try {
      await AppApi.updateSupportTicket(ticketId, { status: backendStatus });
      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      setError(err.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  }

  async function handleAssign(ticketId, assignedTo) {
    setUpdating(true);
    try {
      await AppApi.updateSupportTicket(ticketId, { assignedTo: assignedTo || null });
      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, assignedTo: assignedTo || null } : null));
      }
    } catch (err) {
      setError(err.message || "Failed to assign");
    } finally {
      setUpdating(false);
    }
  }

  async function handleInternalNotes(ticketId, internalNotes) {
    setUpdating(true);
    try {
      await AppApi.updateSupportTicket(ticketId, { internalNotes });
      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket((prev) => (prev ? { ...prev, internalNotes } : null));
      }
    } catch (err) {
      setError(err.message || "Failed to save notes");
    } finally {
      setUpdating(false);
    }
  }

  function handleConvertToSupportTicket() {
    setDetailModalOpen(false);
    setSelectedTicket(null);
  }

  function openDetail(ticket) {
    setSelectedTicket({ ...ticket, status: toColumnStatus(ticket.status) });
    setDetailModalOpen(true);
  }

  function handleDragStart(e, ticket) {
    setDraggedTicket(ticket);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(ticket.id));
  }

  function handleDragOver(e, columnId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }

  function handleDragLeave() {
    setDragOverColumn(null);
  }

  function handleDrop(e, targetCol) {
    e.preventDefault();
    setDragOverColumn(null);
    if (!draggedTicket || toColumnStatus(draggedTicket.status) === targetCol.id) {
      setDraggedTicket(null);
      return;
    }
    handleStatusChange(draggedTicket.id, targetCol.id);
    setDraggedTicket(null);
  }

  function handleDragEnd() {
    setDraggedTicket(null);
    setDragOverColumn(null);
  }

  return (
    <div className="flex h-[100dvh] overflow-hidden">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className={`${PAGE_LAYOUT.listPaddingX} py-6 flex-shrink-0`}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Feedback Management</h1>
                <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage feature requests. Paid tiers are prioritized.</p>
              </div>
              <button
                type="button"
                onClick={fetchTickets}
                disabled={loading}
                className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white disabled:opacity-50 text-sm"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <FilterDropdownWithPills
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search subject, description..."
              filterCategories={filterCategories}
              filterOptions={filterOptions}
              activeFilters={activeFilters}
              onAddFilter={addFilter}
              onRemoveFilter={removeFilter}
              onClearFilters={clearFilters}
              sortOptions={SORT_OPTIONS}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center px-6">
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            </div>
          ) : (
            <div className={`flex-1 min-h-0 overflow-x-auto overflow-y-hidden ${PAGE_LAYOUT.listPaddingX} pb-6`}>
              <div className="flex gap-4 min-w-max pb-4" style={{ minHeight: "calc(100vh - 280px)" }}>
                {COLUMNS.map((col) => (
                  <KanbanColumn
                    key={col.id}
                    title={col.title}
                    count={ticketsByColumn[col.id]?.length || 0}
                    isDragOver={dragOverColumn === col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col)}
                  >
                    {(ticketsByColumn[col.id] || []).map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onClick={() => openDetail(ticket)}
                        onDragStart={(e) => handleDragStart(e, ticket)}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedTicket?.id === ticket.id}
                        variant="feedback"
                      />
                    ))}
                  </KanbanColumn>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {detailModalOpen && selectedTicket && (
        <TicketFormContainer
          ticket={selectedTicket}
          admins={admins}
          variant="feedback"
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedTicket(null);
          }}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
          onInternalNotes={handleInternalNotes}
          onConvertToSupportTicket={handleConvertToSupportTicket}
          onRefresh={fetchTickets}
          updating={updating}
        />
      )}
    </div>
  );
}

export default FeedbackManagement;
