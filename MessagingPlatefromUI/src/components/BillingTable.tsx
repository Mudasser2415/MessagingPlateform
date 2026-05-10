import { useNavigate } from "react-router-dom";
import { Eye, Upload, CheckCircle, XCircle, Image } from "lucide-react";
import type { BillingDto } from "../services/billingService";
import BillingStatusBadge from "./BillingStatusBadge";

interface Props {
  billings: BillingDto[];
  onUpload: (billing: BillingDto) => void;
  onApprove: (billing: BillingDto) => void;
  onReject: (billing: BillingDto) => void;
  onPreview: (billing: BillingDto) => void;
}

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function BillingTable({
  billings,
  onUpload,
  onApprove,
  onReject,
  onPreview,
}: Props) {
  const navigate = useNavigate();

  if (billings.length === 0) {
    return (
      <div className="empty-state">
        <p>No billing records found.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Billing #</th>
            <th>Client</th>
            <th>Quotation #</th>
            <th>Amount</th>
            <th>Credits</th>
            <th>Status</th>
            <th>Method</th>
            <th>Proof</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {billings.map((b) => (
            <tr
              key={b.id}
              className={
                b.paymentStatus === "Pending" ? "row-highlight-pending" : ""
              }
            >
              <td>
                <span className="font-mono text-sm font-semibold">
                  {b.billingNumber}
                </span>
              </td>
              <td>{b.clientName}</td>
              <td>
                <span className="text-muted">{b.quotationNumber}</span>
              </td>
              <td>{formatINR(b.totalAmount)}</td>
              <td>{b.includedCredits.toLocaleString()}</td>
              <td>
                <BillingStatusBadge status={b.paymentStatus} />
              </td>
              <td>{b.paymentMethod}</td>
              <td>
                {b.paymentReferences.length > 0 ? (
                  <button
                    className="proof-count-badge"
                    title="View payment proof"
                    onClick={() => onPreview(b)}
                  >
                    <Image size={12} />
                    {b.paymentReferences.length}
                  </button>
                ) : (
                  <span className="text-muted text-xs">None</span>
                )}
              </td>
              <td>{formatDate(b.createdAt)}</td>
              <td>
                <div className="action-buttons">
                  <button
                    className="btn btn-secondary btn-sm"
                    title="View details"
                    onClick={() => navigate(`/admin/billing/${b.id}`)}
                  >
                    <Eye size={14} />
                  </button>

                  {b.paymentStatus === "Pending" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      title="Upload payment proof"
                      onClick={() => onUpload(b)}
                    >
                      <Upload size={14} />
                    </button>
                  )}

                  {b.paymentStatus === "Pending" && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        title="Approve billing"
                        onClick={() => onApprove(b)}
                      >
                        <CheckCircle size={14} />
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        title="Reject billing"
                        onClick={() => onReject(b)}
                      >
                        <XCircle size={14} />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
