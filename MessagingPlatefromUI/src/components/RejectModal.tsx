import { useState } from "react";
import { XCircle, X, AlertTriangle } from "lucide-react";
import type { BillingDto } from "../services/billingService";

interface Props {
  billing: BillingDto;
  isSubmitting: boolean;
  onConfirm: (rejectionReason: string) => void;
  onClose: () => void;
}

export default function RejectModal({
  billing,
  isSubmitting,
  onConfirm,
  onClose,
}: Props) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const hasError = touched && !reason.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-reject"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-icon modal-header-icon--red">
            <XCircle size={22} />
          </div>
          <div>
            <h2>Reject Billing</h2>
            <p className="modal-header-sub">{billing.billingNumber}</p>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Context */}
        <div className="reject-context">
          <div className="reject-context-row">
            <span>Client</span>
            <strong>{billing.clientName}</strong>
          </div>
          <div className="reject-context-row">
            <span>Amount</span>
            <strong>
              ₹
              {billing.totalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="rejectionReason">
              Rejection Reason <span className="form-required">*</span>
            </label>
            <textarea
              id="rejectionReason"
              className={`form-input${hasError ? " form-input--error" : ""}`}
              rows={4}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Describe why this billing is being rejected…"
              required
            />
            {hasError && (
              <p className="form-error-msg">
                <AlertTriangle size={13} />
                Rejection reason is required.
              </p>
            )}
            <p className="form-hint">{reason.length}/500</p>
          </div>

          <div className="reject-warning-banner">
            <AlertTriangle size={16} />
            This billing will be marked as Rejected. Credits will NOT be
            activated. The client will need to re-submit.
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Rejecting…" : "Confirm Rejection"}
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
