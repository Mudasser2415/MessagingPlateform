import React from "react";
import { Eye, Pencil, CheckCircle, XCircle } from "lucide-react";
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import type { QuotationDto } from "../services/quotationService";

interface Props {
  quotations: QuotationDto[];
  onView: (q: QuotationDto) => void;
  onEdit: (q: QuotationDto) => void;
  onApprove: (q: QuotationDto) => void;
  onReject: (q: QuotationDto) => void;
  isActing: boolean;
}

export const QuotationTable: React.FC<Props> = ({
  quotations,
  onView,
  onEdit,
  onApprove,
  onReject,
  isActing,
}) => {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString();

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Quotation #</th>
            <th>Client</th>
            <th>Plan</th>
            <th>Final Price</th>
            <th>Credits</th>
            <th>Status</th>
            <th>Valid To</th>
          </tr>
        </thead>
        <tbody>
          {quotations.map((q) => (
            <tr key={q.id}>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-secondary btn-sm"
                    title="View"
                    onClick={() => onView(q)}
                  >
                    <Eye size={14} />
                  </button>
                  {q.status !== "Approved" &&
                    q.status !== "Rejected" &&
                    q.status !== "Expired" && (
                      <>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Edit"
                          onClick={() => onEdit(q)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "rgba(34,197,94,0.1)",
                            color: "#15803d",
                            border: "1px solid rgba(34,197,94,0.3)",
                          }}
                          title="Approve"
                          onClick={() => onApprove(q)}
                          disabled={isActing}
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "#dc2626",
                            border: "1px solid rgba(239,68,68,0.3)",
                          }}
                          title="Reject"
                          onClick={() => onReject(q)}
                          disabled={isActing}
                        >
                          <XCircle size={14} />
                        </button>
                      </>
                    )}
                </div>
              </td>
              <td>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    fontFamily: "monospace",
                    color: "var(--primary)",
                  }}
                >
                  {q.quotationNumber}
                </p>
              </td>
              <td>
                <p style={{ fontWeight: 600 }}>{q.clientName}</p>
              </td>
              <td>
                <p style={{ fontWeight: 600 }}>{q.planName}</p>
                <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>
                  {q.durationType}
                </p>
              </td>
              <td>
                <p style={{ fontWeight: 700 }}>
                  ₹{q.finalPrice.toLocaleString()}
                </p>
                {q.discountAmount > 0 && (
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#dc2626",
                      textDecoration: "line-through",
                    }}
                  >
                    ₹{q.originalPrice.toLocaleString()}
                  </p>
                )}
              </td>
              <td>
                <p style={{ fontWeight: 600 }}>
                  {q.includedCredits.toLocaleString()}
                </p>
              </td>
              <td>
                <QuotationStatusBadge status={q.status} />
              </td>
              <td style={{ whiteSpace: "nowrap" }}>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: q.isExpired ? "#dc2626" : "inherit",
                  }}
                >
                  {fmt(q.validTo)}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
