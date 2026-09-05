import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Loader } from "../components/Loader";
import BillingTable from "../components/BillingTable";
import BillingForm from "../components/BillingForm";
import PaymentUpload from "../components/PaymentUpload";
import ApprovalModal from "../components/ApprovalModal";
import RejectModal from "../components/RejectModal";
import PaymentPreviewModal from "../components/PaymentPreviewModal";
import {
  useAllBillings,
  useCreateBilling,
  useUploadPayment,
  useApproveBilling,
  useRejectBilling,
} from "../hooks/useBillings";
import { useAllQuotations } from "../hooks/useQuotations";
import type {
  BillingDto,
  CreateBillingRequest,
} from "../services/billingService";
import type { QuotationDto } from "../services/quotationService";
import { useToastStore } from "../store/toastStore";

type StatusFilter =
  | "All"
  | "Pending"
  | "PartiallyPaid"
  | "Approved"
  | "Rejected";

const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "Pending",
  "PartiallyPaid",
  "Approved",
  "Rejected",
];

function formatINR(n: number) {
  return `\u20B9${n.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

export function AdminBillingTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<BillingDto | null>(null);
  const [approveTarget, setApproveTarget] = useState<BillingDto | null>(null);
  const [rejectTarget, setRejectTarget] = useState<BillingDto | null>(null);
  const [previewTarget, setPreviewTarget] = useState<BillingDto | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { addToast } = useToastStore();

  const { data: billings = [], isLoading } = useAllBillings(
    statusFilter === "All" ? undefined : statusFilter,
    undefined,
    search || undefined,
  );

  const { data: allQuotations = [] } = useAllQuotations("Approved");
  const quotationLookup = allQuotations.reduce<Record<string, QuotationDto>>(
    (acc, quotation) => {
      acc[quotation.id] = quotation;
      return acc;
    },
    {},
  );
  const billedQuotationIds = new Set(billings.map((b) => b.quotationId));
  const availableQuotations = allQuotations.filter(
    (q) => !billedQuotationIds.has(q.id),
  );

  const createMutation = useCreateBilling();
  const uploadMutation = useUploadPayment();
  const approveMutation = useApproveBilling();
  const rejectMutation = useRejectBilling();

  // Summary counts
  const total = billings.length;
  const pending = billings.filter((b) => b.paymentStatus === "Pending").length;
  const approved = billings.filter(
    (b) => b.paymentStatus === "Approved",
  ).length;
  const rejected = billings.filter(
    (b) => b.paymentStatus === "Rejected",
  ).length;
  const revenue = billings
    .filter((b) => b.paymentStatus === "Approved")
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const handleCreate = (data: CreateBillingRequest) => {
    createMutation.mutate(data, { onSuccess: () => setShowCreate(false) });
  };

  const handleUploadSubmit = () => {
    if (!uploadTarget || !uploadFile) {
      addToast("Please select a file.", "error");
      return;
    }
    uploadMutation.mutate(
      { billingId: uploadTarget.id, file: uploadFile },
      {
        onSuccess: () => {
          setUploadTarget(null);
          setUploadFile(null);
        },
      },
    );
  };

  const handleApproveConfirm = (approvalNotes?: string) => {
    if (!approveTarget) return;
    approveMutation.mutate(
      { id: approveTarget.id, approvalNotes },
      { onSuccess: () => setApproveTarget(null) },
    );
  };

  const handleRejectConfirm = (rejectionReason: string) => {
    if (!rejectTarget) return;
    rejectMutation.mutate(
      { id: rejectTarget.id, rejectionReason },
      { onSuccess: () => setRejectTarget(null) },
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "grid",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <h2 style={{ fontWeight: 800, fontSize: "1.15rem" }}>
                Billing Directory
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
                Manage invoices, payment proofs, and credit activation.
              </p>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <button
                className="btn btn-primary"
                onClick={() => setShowCreate(true)}
                style={{
                  width: "auto",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                <Plus size={14} /> New Billing
              </button>
              <div
                style={{
                  whiteSpace: "nowrap",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {billings.length} showing
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            {[
              ["Total", total, "#4338ca", "rgba(67,56,202,0.1)"],
              ["Pending", pending, "#d97706", "rgba(217,119,6,0.12)"],
              ["Approved", approved, "#15803d", "rgba(21,128,61,0.12)"],
              ["Rejected", rejected, "#dc2626", "rgba(220,38,38,0.12)"],
            ].map(([label, value, color, bg]) => (
              <button
                key={String(label)}
                type="button"
                onClick={() => {
                  const next =
                    String(label) === "Total"
                      ? "All"
                      : (String(label) as StatusFilter);
                  setStatusFilter(statusFilter === next ? "All" : next);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.35rem",
                  borderRadius: "999px",
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                }}
                title={`${label}: ${value}`}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: String(bg),
                    color: String(color),
                    fontSize: "0.72rem",
                    fontWeight: 800,
                  }}
                >
                  {value}
                </span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                  {label}
                </span>
              </button>
            ))}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0.35rem",
                borderRadius: "999px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(37,99,235,0.12)",
                  color: "#2563eb",
                  fontSize: "0.7rem",
                  fontWeight: 800,
                }}
              >
                ₹
              </span>
              <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                {formatINR(revenue)}
              </span>
            </div>
          </div>

          <div
            className="stack-mobile"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.6fr) minmax(180px, 0.7fr) auto",
              gap: "0.85rem",
            }}
          >
            <form onSubmit={handleSearch} style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--secondary)",
                }}
              />
              <input
                className="form-input"
                style={{ marginBottom: 0, paddingLeft: "2.25rem" }}
                placeholder="Search billing #, client, quotation"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>

            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              style={{ marginBottom: 0 }}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "PartiallyPaid" ? "Partial" : s}
                </option>
              ))}
            </select>

            {searchInput || search || statusFilter !== "All" ? (
              <button
                type="button"
                className="btn btn-secondary btn-sm btn-inline-auto"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setStatusFilter("All");
                }}
                style={{ alignSelf: "stretch" }}
              >
                <X size={14} /> Clear
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {isLoading ? (
          <Loader />
        ) : (
          <BillingTable
            billings={billings}
            quotationLookup={quotationLookup}
            onUpload={(b) => {
              setUploadTarget(b);
              setUploadFile(null);
            }}
            onApprove={(b) => setApproveTarget(b)}
            onReject={(b) => setRejectTarget(b)}
            onPreview={(b) => setPreviewTarget(b)}
          />
        )}
      </section>

      {/* ── Create Billing Modal ────────────────────────────────────────── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Billing</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreate(false)}
              >
                <X size={20} />
              </button>
            </div>
            <BillingForm
              key={showCreate ? "open" : "closed"}
              approvedQuotations={availableQuotations}
              onSubmit={handleCreate}
              isSubmitting={createMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* ── Upload Payment Proof Modal ───────────────────────────────────── */}
      {uploadTarget && (
        <div className="modal-overlay" onClick={() => setUploadTarget(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Payment Proof</h2>
              <button
                className="modal-close"
                onClick={() => setUploadTarget(null)}
              >
                <X size={20} />
              </button>
            </div>
            <p className="modal-subtitle">
              Billing: <strong>{uploadTarget.billingNumber}</strong> · Client:{" "}
              <strong>{uploadTarget.clientName}</strong>
            </p>
            <PaymentUpload
              onFileSelected={setUploadFile}
              selectedFile={uploadFile}
            />
            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleUploadSubmit}
                disabled={!uploadFile || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setUploadTarget(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Approval Modal ───────────────────────────────────────────────── */}
      {approveTarget && (
        <ApprovalModal
          billing={approveTarget}
          isSubmitting={approveMutation.isPending}
          onConfirm={handleApproveConfirm}
          onClose={() => setApproveTarget(null)}
        />
      )}

      {/* ── Reject Modal ─────────────────────────────────────────────────── */}
      {rejectTarget && (
        <RejectModal
          billing={rejectTarget}
          isSubmitting={rejectMutation.isPending}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectTarget(null)}
        />
      )}

      {/* ── Payment Preview Modal ─────────────────────────────────────────── */}
      {previewTarget && (
        <PaymentPreviewModal
          billing={previewTarget}
          onClose={() => setPreviewTarget(null)}
        />
      )}
    </div>
  );
}
