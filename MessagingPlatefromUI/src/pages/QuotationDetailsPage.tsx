import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CreditCard,
  FileText,
  XCircle,
} from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader } from "../components/Loader";
import { QuotationStatusBadge } from "../components/QuotationStatusBadge";
import {
  useApproveQuotation,
  useQuotation,
  useRejectQuotation,
} from "../hooks/useQuotations";
import { useToastStore } from "../store/toastStore";

export const QuotationDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);

  const { data: q, isLoading, isError } = useQuotation(id ?? "");
  const approveMutation = useApproveQuotation();
  const rejectMutation = useRejectQuotation();

  const canAct = q?.status === "Sent" || q?.status === "Draft";

  const handleApprove = async () => {
    if (!q) return;
    if (
      !window.confirm(
        `Approve ${q.quotationNumber}?\n\nThis will allocate ${q.includedCredits} credits to ${q.clientName}.`,
      )
    )
      return;
    try {
      await approveMutation.mutateAsync(q.id);
      addToast("Quotation approved — credits allocated", "success");
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Approval failed", "error");
    }
  };

  const handleReject = async () => {
    if (!q) return;
    if (!window.confirm(`Reject quotation ${q.quotationNumber}?`)) return;
    try {
      await rejectMutation.mutateAsync(q.id);
      addToast("Quotation rejected", "success");
    } catch (err: unknown) {
      addToast(
        err instanceof Error ? err.message : "Rejection failed",
        "error",
      );
    }
  };

  if (isLoading) return <Loader label="Loading quotation…" />;
  if (isError || !q)
    return (
      <div
        className="stat-card"
        style={{ padding: "2rem", textAlign: "center" }}
      >
        <p style={{ color: "var(--secondary)" }}>Quotation not found.</p>
        <button
          className="btn btn-secondary"
          style={{ marginTop: "1rem" }}
          onClick={() => navigate("/admin/quotations")}
        >
          Back to Quotations
        </button>
      </div>
    );

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate("/admin/quotations")}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <h2 style={{ fontWeight: 700, fontSize: "1.2rem" }}>
              {q.quotationNumber}
            </h2>
            <QuotationStatusBadge status={q.status} />
          </div>
          <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
            Created {new Date(q.createdAt).toLocaleDateString()} by{" "}
            {q.createdBy ?? "—"}
          </p>
        </div>
        {canAct && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-sm"
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "#15803d",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              <CheckCircle size={14} /> Approve
            </button>
            <button
              className="btn btn-sm"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#dc2626",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        )}
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {/* Client & Plan */}
        <div className="stat-card" style={{ display: "grid", gap: "0.6rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <FileText size={16} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Details</span>
          </div>
          <Row label="Client" value={q.clientName} />
          <Row label="Plan" value={q.subscriptionPlanId} />
          <Row label="Notes" value={q.notes || "—"} />
        </div>

        {/* Pricing */}
        <div className="stat-card" style={{ display: "grid", gap: "0.6rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <CreditCard size={16} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>Pricing</span>
          </div>
          <Row
            label="Original Price"
            value={`₹${q.originalPrice.toLocaleString()}`}
          />
          <Row
            label="Discount"
            value={`₹${q.discountAmount.toLocaleString()}`}
          />
          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "0.4rem",
              marginTop: "0.2rem",
            }}
          >
            <Row
              label="Final Price"
              value={`₹${q.finalPrice.toLocaleString()}`}
              bold
            />
          </div>
          <Row
            label="Included Credits"
            value={q.includedCredits.toLocaleString()}
          />
        </div>

        {/* Validity */}
        <div className="stat-card" style={{ display: "grid", gap: "0.6rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <Calendar size={16} color="var(--primary)" />
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>
              Validity
            </span>
          </div>
          <Row
            label="Valid From"
            value={new Date(q.validFrom).toLocaleDateString()}
          />
          <Row
            label="Valid To"
            value={new Date(q.validTo).toLocaleDateString()}
          />
          {q.updatedAt && (
            <Row
              label="Last Updated"
              value={new Date(q.updatedAt).toLocaleDateString()}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean }> = ({
  label,
  value,
  bold,
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: "0.83rem",
    }}
  >
    <span style={{ color: "var(--secondary)" }}>{label}</span>
    <span style={{ fontWeight: bold ? 700 : 500 }}>{value}</span>
  </div>
);
