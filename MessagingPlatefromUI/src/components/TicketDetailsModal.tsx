import { X, User, Calendar, Clock, Tag, AlertCircle } from "lucide-react";
import type { TicketDto } from "../services/ticketService";
import { TicketStatusBadge, SlaBadge, PriorityBadge } from "./TicketTable";

interface Props {
  ticket: TicketDto;
  onClose: () => void;
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="tkd-row">
      <dt className="tkd-label">{label}</dt>
      <dd className="tkd-value">{children}</dd>
    </div>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const TicketDetailsModal: React.FC<Props> = ({ ticket, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content tkd-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="tkd-header">
          <div>
            <span className="tkd-ticket-number">{ticket.ticketNumber}</span>
            <span className="tk-type-badge" style={{ marginLeft: "0.75rem" }}>
              {ticket.ticketType === "INC" ? "Incident" : "Service Request"}
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Badges row */}
        <div className="tkd-badges">
          <TicketStatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <SlaBadge sla={ticket.slaStatus} />
        </div>

        {/* Details grid */}
        <dl className="tkd-grid">
          <Row label="Client">
            <User
              size={13}
              style={{ marginRight: 4, verticalAlign: "middle" }}
            />
            {ticket.clientName}
          </Row>
          <Row label="Mobile">{ticket.mobileNumber}</Row>
          <Row label="Issue Date">
            <Calendar
              size={13}
              style={{ marginRight: 4, verticalAlign: "middle" }}
            />
            {formatDate(ticket.issueDate)}
          </Row>
          <Row label="Created By">
            <Tag
              size={13}
              style={{ marginRight: 4, verticalAlign: "middle" }}
            />
            {ticket.createdBy || "—"}
          </Row>
          {ticket.assignedToName && (
            <Row label="Assigned To">{ticket.assignedToName}</Row>
          )}
          {ticket.resolvedAt && (
            <Row label="Resolved At">
              <Clock
                size={13}
                style={{ marginRight: 4, verticalAlign: "middle" }}
              />
              {formatDate(ticket.resolvedAt)}
            </Row>
          )}
          {ticket.closedAt && (
            <Row label="Closed At">
              <Clock
                size={13}
                style={{ marginRight: 4, verticalAlign: "middle" }}
              />
              {formatDate(ticket.closedAt)}
            </Row>
          )}
        </dl>

        {/* Description */}
        <section className="tkd-section">
          <h4 className="tkd-section-title">
            <AlertCircle size={14} />
            Issue Description
          </h4>
          <p className="tkd-description">{ticket.issueDescription}</p>
        </section>

        {ticket.resolutionDescription && (
          <section className="tkd-section tkd-section--resolution">
            <h4 className="tkd-section-title">Resolution</h4>
            <p className="tkd-description">{ticket.resolutionDescription}</p>
          </section>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
