import { useState } from "react";
import { PlusCircle, RefreshCw, Ticket } from "lucide-react";
import {
  useTickets,
  useCreateTicket,
  useUpdateTicket,
  useCloseTicket,
} from "../hooks/useTickets";
import { TicketForm } from "../components/TicketForm";
import { TicketTable } from "../components/TicketTable";
import { TicketDetailsModal } from "../components/TicketDetailsModal";
import { useToastStore } from "../store/toastStore";
import type {
  TicketDto,
  TicketQueryParams,
  TicketStatus,
  TicketPriority,
  TicketType,
  SlaStatus,
  CreateTicketRequest,
  UpdateTicketRequest,
} from "../services/ticketService";

const PAGE_SIZE = 20;

const emptyFilters = (): TicketQueryParams => ({
  search: "",
  status: "",
  priority: "",
  ticketType: "",
  slaStatus: "",
  fromDate: "",
  toDate: "",
  page: 1,
  pageSize: PAGE_SIZE,
});

export const AdminTicketsPage: React.FC = () => {
  const { addToast } = useToastStore();

  // Filter + pagination state
  const [filters, setFilters] = useState<TicketQueryParams>(emptyFilters());

  // Modal state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketDto | null>(null);
  const [viewingTicket, setViewingTicket] = useState<TicketDto | null>(null);
  const [closingTicket, setClosingTicket] = useState<TicketDto | null>(null);

  // Data
  const { data, isLoading, isError, refetch } = useTickets(filters);
  const createMutation = useCreateTicket();
  const updateMutation = useUpdateTicket();
  const closeMutation = useCloseTicket();

  const tickets = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const setFilter = <K extends keyof TicketQueryParams>(
    key: K,
    value: TicketQueryParams[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleCreateSubmit = (
    data: CreateTicketRequest | UpdateTicketRequest,
  ) => {
    createMutation.mutate(data as CreateTicketRequest, {
      onSuccess: (ticket) => {
        addToast(`Ticket ${ticket.ticketNumber} created.`, "success");
        setShowCreateForm(false);
      },
      onError: (err: any) => {
        addToast(
          err?.response?.data?.message || "Failed to create ticket.",
          "error",
        );
      },
    });
  };

  const handleEditSubmit = (
    data: CreateTicketRequest | UpdateTicketRequest,
  ) => {
    if (!editingTicket) return;
    updateMutation.mutate(
      { id: editingTicket.ticketId, body: data as UpdateTicketRequest },
      {
        onSuccess: () => {
          addToast("Ticket updated.", "success");
          setEditingTicket(null);
        },
        onError: (err: any) => {
          addToast(
            err?.response?.data?.message || "Failed to update ticket.",
            "error",
          );
        },
      },
    );
  };

  const handleClose = () => {
    if (!closingTicket) return;
    closeMutation.mutate(closingTicket.ticketId, {
      onSuccess: () => {
        addToast("Ticket closed.", "success");
        setClosingTicket(null);
      },
      onError: (err: any) => {
        addToast(
          err?.response?.data?.message || "Failed to close ticket.",
          "error",
        );
      },
    });
  };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const openCount = tickets.filter((t) => t.status === "Open").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "InProgress",
  ).length;
  const breachedCount = tickets.filter(
    (t) => t.slaStatus === "Breached",
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-container tk-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Ticket size={22} color="var(--primary)" />
            <h1 className="page-title">Ticket Management</h1>
          </div>
          <p className="page-subtitle">
            Track incidents and service requests with SLA monitoring
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            className="btn btn-secondary"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <PlusCircle size={16} />
            New Ticket
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="tk-summary-cards">
        <div className="tk-summary-card tk-summary-card--open">
          <span className="tk-summary-num">{openCount}</span>
          <span className="tk-summary-label">Open</span>
        </div>
        <div className="tk-summary-card tk-summary-card--inprogress">
          <span className="tk-summary-num">{inProgressCount}</span>
          <span className="tk-summary-label">In Progress</span>
        </div>
        <div className="tk-summary-card tk-summary-card--breached">
          <span className="tk-summary-num">{breachedCount}</span>
          <span className="tk-summary-label">SLA Breached</span>
        </div>
        <div className="tk-summary-card">
          <span className="tk-summary-num">{totalCount}</span>
          <span className="tk-summary-label">Total (page)</span>
        </div>
      </div>

      {/* Filters */}
      <div className="tk-filters">
        <input
          type="search"
          className="form-input tk-filter-search"
          placeholder="Search ticket #, client, mobile…"
          value={filters.search ?? ""}
          onChange={(e) => setFilter("search", e.target.value)}
        />

        <select
          className="form-input tk-filter-select"
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilter("status", e.target.value as TicketStatus | "")
          }
        >
          <option value="">All Statuses</option>
          {(
            [
              "Open",
              "InProgress",
              "Resolved",
              "Closed",
              "Rejected",
            ] as TicketStatus[]
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          className="form-input tk-filter-select"
          value={filters.priority ?? ""}
          onChange={(e) =>
            setFilter("priority", e.target.value as TicketPriority | "")
          }
        >
          <option value="">All Priorities</option>
          {(["Low", "Medium", "High", "Critical"] as TicketPriority[]).map(
            (p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ),
          )}
        </select>

        <select
          className="form-input tk-filter-select"
          value={filters.ticketType ?? ""}
          onChange={(e) =>
            setFilter("ticketType", e.target.value as TicketType | "")
          }
        >
          <option value="">All Types</option>
          <option value="INC">INC — Incident</option>
          <option value="SR">SR — Service Request</option>
        </select>

        <select
          className="form-input tk-filter-select"
          value={filters.slaStatus ?? ""}
          onChange={(e) =>
            setFilter("slaStatus", e.target.value as SlaStatus | "")
          }
        >
          <option value="">All SLA</option>
          <option value="Met">Met</option>
          <option value="Breached">Breached</option>
        </select>

        <input
          type="date"
          className="form-input tk-filter-date"
          value={filters.fromDate ?? ""}
          onChange={(e) => setFilter("fromDate", e.target.value)}
          title="From date"
        />
        <input
          type="date"
          className="form-input tk-filter-date"
          value={filters.toDate ?? ""}
          onChange={(e) => setFilter("toDate", e.target.value)}
          title="To date"
        />

        {(filters.search ||
          filters.status ||
          filters.priority ||
          filters.ticketType ||
          filters.slaStatus ||
          filters.fromDate ||
          filters.toDate) && (
          <button
            className="btn btn-secondary"
            onClick={() => setFilters(emptyFilters())}
          >
            Clear
          </button>
        )}
      </div>

      {/* Error */}
      {isError && (
        <div className="tk-error-banner">
          Unable to load tickets. Please try again.
        </div>
      )}

      {/* Table */}
      <TicketTable
        tickets={tickets}
        totalCount={totalCount}
        page={filters.page ?? 1}
        pageSize={PAGE_SIZE}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        onView={(t) => setViewingTicket(t)}
        onEdit={(t) => setEditingTicket(t)}
        onClose={(t) => setClosingTicket(t)}
        isLoading={isLoading}
      />

      {/* ── Create modal ── */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 540 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Create New Ticket</h2>
            </div>
            <TicketForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={createMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editingTicket && (
        <div className="modal-overlay" onClick={() => setEditingTicket(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 500 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">
                Edit Ticket — {editingTicket.ticketNumber}
              </h2>
            </div>
            <TicketForm
              ticket={editingTicket}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingTicket(null)}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* ── View modal ── */}
      {viewingTicket && (
        <TicketDetailsModal
          ticket={viewingTicket}
          onClose={() => setViewingTicket(null)}
        />
      )}

      {/* ── Close confirmation modal ── */}
      {closingTicket && (
        <div className="modal-overlay" onClick={() => setClosingTicket(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 420 }}
          >
            <div className="modal-header">
              <h2 className="modal-title">Close Ticket</h2>
            </div>
            <p style={{ margin: "0.5rem 0 1.5rem", color: "var(--secondary)" }}>
              Close ticket <strong>{closingTicket.ticketNumber}</strong>? This
              action cannot be undone.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setClosingTicket(null)}
                disabled={closeMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleClose}
                disabled={closeMutation.isPending}
              >
                {closeMutation.isPending ? "Closing…" : "Close Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
