import { useState } from "react";
import { CheckCircle, X, Image } from "lucide-react";
import type { BillingDto } from "../services/billingService";

interface Props {
  billing: BillingDto;
  isSubmitting: boolean;
  onConfirm: (approvalNotes?: string) => void;
  onClose: () => void;
}

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function ApprovalModal({
  billing,
  isSubmitting,
  onConfirm,
  onClose,
}: Props) {
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(notes.trim() || undefined);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-approval"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-icon modal-header-icon--green">
            <CheckCircle size={22} />
          </div>
          <div>
            <h2>Approve Billing</h2>
            <p className="modal-header-sub">{billing.billingNumber}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Billing summary */}
        <div className="approval-summary-grid">
          <div className="approval-summary-item">
            <span className="approval-summary-label">Client</span>
            <span className="approval-summary-value">{billing.clientName}</span>
          </div>
          <div className="approval-summary-item">
            <span className="approval-summary-label">Quotation</span>
            <span className="approval-summary-value">
              {billing.quotationNumber}
            </span>
          </div>
          <div className="approval-summary-item">
            <span className="approval-summary-label">Amount</span>
            <span className="approval-summary-value approval-summary-value--amount">
              {formatINR(billing.totalAmount)}
            </span>
          </div>
          <div className="approval-summary-item">
            <span className="approval-summary-label">Credits to Activate</span>
            <span className="approval-summary-value approval-summary-value--credits">
              {billing.includedCredits.toLocaleString()} credits
            </span>
          </div>
        </div>

        {/* Payment proofs */}
        {billing.paymentReferences.length > 0 && (
          <div className="approval-proofs">
            <p className="approval-proofs-label">
              <Image size={14} />
              Payment Proof ({billing.paymentReferences.length} file
              {billing.paymentReferences.length > 1 ? "s" : ""})
            </p>
            <div className="approval-proof-thumbnails">
              {billing.paymentReferences.map((ref) => {
                const isImg = ["JPG", "JPEG", "PNG"].includes(
                  ref.fileType.toUpperCase(),
                );
                return (
                  <a
                    key={ref.id}
                    href={`http://localhost:5008${ref.fileUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="proof-thumb-link"
                    title={ref.fileName}
                  >
                    {isImg ? (
                      <img
                        src={`http://localhost:5008${ref.fileUrl}`}
                        alt={ref.fileName}
                        className="proof-thumb-img"
                      />
                    ) : (
                      <div className="proof-thumb-pdf">PDF</div>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {billing.paymentReferences.length === 0 && (
          <div className="approval-no-proof">
            ⚠ No payment proof uploaded. Approval may be blocked.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="approvalNotes">
              Approval Notes{" "}
              <span className="form-label-optional">(optional)</span>
            </label>
            <textarea
              id="approvalNotes"
              className="form-input"
              rows={3}
              maxLength={1000}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes about this approval…"
            />
          </div>

          <div className="approval-confirm-banner">
            Approving will activate{" "}
            <strong>{billing.includedCredits.toLocaleString()} credits</strong>{" "}
            for <strong>{billing.clientName}</strong>. This action cannot be
            undone.
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Approving…" : "Confirm Approval"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
