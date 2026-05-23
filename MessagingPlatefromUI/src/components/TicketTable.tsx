import {
  Eye,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import type {
  TicketDto,
  TicketStatus,
  SlaStatus,
} from "../services/ticketService";

// ── Badge helpers ─────────────────────────────────────────────────────────────

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const map: Record<TicketStatus, string> = {
    Open: "tk-badge tk-badge--open",
    InProgress: "tk-badge tk-badge--inprogress",
    Resolved: "tk-badge tk-badge--resolved",
    Closed: "tk-badge tk-badge--closed",
    Rejected: "tk-badge tk-badge--rejected",
  };
  return <span className={map[status]}>{status}</span>;
}

export function SlaBadge({ sla }: { sla: SlaStatus }) {
  return (
    <span
      className={`tk-badge ${sla === "Met" ? "tk-badge--sla-met" : "tk-badge--sla-breached"}`}
    >
      {sla === "Breached" && (
        <AlertTriangle size={11} style={{ marginRight: 3 }} />
      )}
      {sla}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Low: "tk-badge tk-badge--low",
    Medium: "tk-badge tk-badge--medium",
    High: "tk-badge tk-badge--high",
    Critical: "tk-badge tk-badge--critical",
  };
  return <span className={map[priority] ?? "tk-badge"}>{priority}</span>;
}

// ── Table ─────────────────────────────────────────────────────────────────────

interface TableProps {
  tickets: TicketDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onView: (t: TicketDto) => void;
  onEdit: (t: TicketDto) => void;
  onClose: (t: TicketDto) => void;
  isLoading: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const TicketTable: React.FC<TableProps> = ({
  tickets,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onView,
  onEdit,
  onClose,
  isLoading,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  if (isLoading) {
    return (
      <div className="tk-skeleton-wrapper">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="tk-skeleton-row" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="tk-empty">
        <span>No tickets found.</span>
      </div>
    );
  }

  return (
    <div className="tk-table-container">
      <div className="tk-table-scroll">
        <table className="tk-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Client</th>
              <th>Mobile</th>
              <th>Issue Date</th>
              <th>Type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>SLA</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.ticketId}
                className={t.slaStatus === "Breached" ? "tk-row--breached" : ""}
              >
                <td>
                  <span className="tk-ticket-number">{t.ticketNumber}</span>
                </td>
                <td className="tk-cell-name">{t.clientName}</td>
                <td>{t.mobileNumber}</td>
                <td className="tk-cell-date">{formatDate(t.issueDate)}</td>
                <td>
                  <span className="tk-type-badge">{t.ticketType}</span>
                </td>
                <td>
                  <PriorityBadge priority={t.priority} />
                </td>
                <td>
                  <TicketStatusBadge status={t.status} />
                </td>
                <td>
                  <SlaBadge sla={t.slaStatus} />
                </td>
                <td>
                  <div className="tk-actions">
                    <button
                      className="tk-action-btn tk-action-btn--view"
                      title="View details"
                      onClick={() => onView(t)}
                    >
                      <Eye size={14} />
                    </button>
                    {t.status !== "Closed" && t.status !== "Rejected" && (
                      <button
                        className="tk-action-btn tk-action-btn--edit"
                        title="Edit ticket"
                        onClick={() => onEdit(t)}
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {t.status !== "Closed" && t.status !== "Rejected" && (
                      <button
                        className="tk-action-btn tk-action-btn--close"
                        title="Close ticket"
                        onClick={() => onClose(t)}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="tk-pagination">
        <span className="tk-pagination-info">
          {from}–{to} of {totalCount}
        </span>
        <div className="tk-pagination-controls">
          <button
            className="tk-page-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft size={15} />
          </button>
          <span className="tk-page-label">
            {page} / {totalPages}
          </span>
          <button
            className="tk-page-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
