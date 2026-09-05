import React, { useEffect, useState } from "react";
import { usePlans } from "../hooks/useSubscriptions";
import type {
  CreateQuotationRequest,
  UpdateQuotationRequest,
  QuotationDto,
} from "../services/quotationService";
import { useQuery } from "@tanstack/react-query";
import { adminClientService } from "../services/adminService";

interface Props {
  initial?: QuotationDto | null;
  onSubmit: (data: CreateQuotationRequest | UpdateQuotationRequest) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const toDateInput = (iso?: string | null) => (iso ? iso.slice(0, 10) : "");

export const QuotationForm: React.FC<Props> = ({
  initial,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const { data: plans = [] } = usePlans(false);
  const { data: clients = [] } = useQuery({
    queryKey: ["admin-clients-for-quotation-form"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const [clientId, setClientId] = useState(initial?.clientId ?? "");
  const [planId, setPlanId] = useState(initial?.subscriptionPlanId ?? "");
  const toDiscountPct = (amount: number, price: number) =>
    price > 0 ? String(Math.round((amount / price) * 10000) / 100) : "0";

  const [discountPct, setDiscountPct] = useState(
    toDiscountPct(initial?.discountAmount ?? 0, initial ? 1 : 0),
  );
  const [validFrom, setValidFrom] = useState(toDateInput(initial?.validFrom));
  const [validTo, setValidTo] = useState(toDateInput(initial?.validTo));
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const selectedPlan = plans.find((p) => p.id === planId);
  const originalPrice = selectedPlan?.price ?? 0;
  const pctNum = Math.min(Math.max(parseFloat(discountPct) || 0, 0), 100);
  const discountNum = Math.round(originalPrice * pctNum) / 100;
  const finalPrice = originalPrice - discountNum;

  // Reset discount % when plan changes (create mode only)
  useEffect(() => {
    if (!initial && selectedPlan) {
      setDiscountPct("0");
    }
  }, [planId]);

  // Initialise discount % once plan data loads (edit mode)
  useEffect(() => {
    if (initial && selectedPlan && discountPct === "0") {
      setDiscountPct(toDiscountPct(initial.discountAmount, selectedPlan.price));
    }
  }, [selectedPlan?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      subscriptionPlanId: planId,
      discountAmount: discountNum,
      validFrom: new Date(validFrom).toISOString(),
      validTo: new Date(validTo).toISOString(),
      notes: notes || undefined,
      ...(initial ? {} : { clientId }),
    } as CreateQuotationRequest | UpdateQuotationRequest;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.9rem" }}>
      {/* Client (only on create) */}
      {!initial && (
        <label className="form-label">
          Client *
          <select
            className="form-input"
            required
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">Select client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Plan */}
      <label className="form-label">
        Subscription Plan *
        <select
          className="form-input"
          required
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
        >
          <option value="">Select plan…</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.planName} — {p.durationType} — ₹{p.price.toLocaleString()}
            </option>
          ))}
        </select>
      </label>

      {/* Pricing summary */}
      {selectedPlan && (
        <div
          className="stack-mobile grid-cols-tablet-2"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.75rem",
          }}
        >
          <div className="stat-card" style={{ padding: "0.75rem" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--secondary)" }}>
              Original Price
            </p>
            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              ₹{originalPrice.toLocaleString()}
            </p>
          </div>
          <div className="stat-card" style={{ padding: "0.75rem" }}>
            <p style={{ fontSize: "0.72rem", color: "var(--secondary)" }}>
              Discount
            </p>
            <p
              style={{ fontWeight: 700, fontSize: "1.1rem", color: "#dc2626" }}
            >
              − ₹{discountNum.toLocaleString()}
            </p>
          </div>
          <div
            className="stat-card"
            style={{
              padding: "0.75rem",
              background: "rgba(34,197,94,0.07)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <p style={{ fontSize: "0.72rem", color: "var(--secondary)" }}>
              Final Price
            </p>
            <p
              style={{ fontWeight: 700, fontSize: "1.1rem", color: "#15803d" }}
            >
              ₹{finalPrice.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Discount */}
      <label className="form-label">
        Discount (%)
        <div style={{ position: "relative" }}>
          <input
            className="form-input"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={discountPct}
            onChange={(e) => setDiscountPct(e.target.value)}
            style={{ paddingRight: "2.5rem" }}
          />
          <span
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--secondary)",
              fontSize: "0.85rem",
              pointerEvents: "none",
            }}
          >
            %
          </span>
        </div>
        {originalPrice > 0 && pctNum > 0 && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--secondary)",
              marginTop: "0.2rem",
              display: "block",
            }}
          >
            = ₹{discountNum.toLocaleString()} off
          </span>
        )}
      </label>

      {/* Credits included (read-only from plan) */}
      {selectedPlan && (
        <label className="form-label">
          Included Credits
          <input
            className="form-input"
            type="number"
            readOnly
            value={selectedPlan.includedCredits}
            style={{ opacity: 0.65, cursor: "not-allowed" }}
          />
        </label>
      )}

      {/* Validity */}
      <div
        className="stack-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
        }}
      >
        <label className="form-label">
          Valid From *
          <input
            className="form-input"
            type="date"
            required
            value={validFrom}
            onChange={(e) => setValidFrom(e.target.value)}
          />
        </label>
        <label className="form-label">
          Valid To *
          <input
            className="form-input"
            type="date"
            required
            value={validTo}
            min={validFrom}
            onChange={(e) => setValidTo(e.target.value)}
          />
        </label>
      </div>

      {/* Notes */}
      <label className="form-label">
        Notes
        <textarea
          className="form-input"
          rows={3}
          placeholder="Optional notes for the client…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {initial ? "Save Changes" : "Create Quotation"}
        </button>
      </div>
    </form>
  );
};
