import { useState } from "react";
import type { QuotationDto } from "../services/quotationService";
import type {
  CreateBillingRequest,
  PaymentMethod,
} from "../services/billingService";

const PAYMENT_METHODS: { label: string; value: number; key: PaymentMethod }[] =
  [
    { label: "Cash", value: 0, key: "Cash" },
    { label: "UPI", value: 1, key: "UPI" },
    { label: "Bank Transfer", value: 2, key: "BankTransfer" },
    { label: "Razorpay", value: 3, key: "Razorpay" },
    { label: "Stripe", value: 4, key: "Stripe" },
  ];

interface Props {
  approvedQuotations: QuotationDto[];
  onSubmit: (data: CreateBillingRequest) => void;
  isSubmitting: boolean;
}

function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export default function BillingForm({
  approvedQuotations,
  onSubmit,
  isSubmitting,
}: Props) {
  const [quotationId, setQuotationId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(0);
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedQuotation = approvedQuotations.find(
    (q) => q.id === quotationId,
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!quotationId) errs.quotationId = "Please select an approved quotation.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ quotationId, paymentMethod, notes: notes || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="billing-form">
      {/* Quotation selector */}
      <div className="form-group">
        <label className="form-label">Approved Quotation *</label>
        <select
          className="form-input"
          value={quotationId}
          onChange={(e) => setQuotationId(e.target.value)}
        >
          <option value="">— Select quotation —</option>
          {approvedQuotations.map((q) => (
            <option key={q.id} value={q.id}>
              {q.quotationNumber} — {q.clientName} — ₹
              {q.finalPrice.toLocaleString("en-IN")}
            </option>
          ))}
        </select>
        {errors.quotationId && (
          <span className="form-error">{errors.quotationId}</span>
        )}
      </div>

      {/* Auto-filled info */}
      {selectedQuotation && (
        <div className="billing-preview-card">
          <div className="preview-row">
            <span className="preview-label">Client</span>
            <span className="preview-value">
              {selectedQuotation.clientName}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Plan</span>
            <span className="preview-value">{selectedQuotation.planName}</span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Total Amount</span>
            <span className="preview-value preview-amount">
              {formatINR(selectedQuotation.finalPrice)}
            </span>
          </div>
          <div className="preview-row">
            <span className="preview-label">Credits Included</span>
            <span className="preview-value preview-credits">
              {selectedQuotation.includedCredits.toLocaleString()} credits
            </span>
          </div>
        </div>
      )}

      {/* Payment method */}
      <div className="form-group">
        <label className="form-label">Payment Method *</label>
        <select
          className="form-input"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(Number(e.target.value))}
        >
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notes */}
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea
          className="form-input"
          rows={3}
          maxLength={1000}
          placeholder="Optional notes or payment reference..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating…" : "Create Billing"}
        </button>
      </div>
    </form>
  );
}
