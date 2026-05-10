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
import type { BillingDto, CreateBillingRequest } from "../services/billingService";
import { useToastStore } from "../store/toastStore";

type StatusFilter = "All" | "Pending" | "PartiallyPaid" | "Approved" | "Rejected";

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
  const approved = billings.filter((b) => b.paymentStatus === "Approved").length;
  const rejected = billings.filter((b) => b.paymentStatus === "Rejected").length;
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
      { onSuccess: () => { setUploadTarget(null); setUploadFile(null); } },
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
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Payments</h1>
          <p className="page-subtitle">
            Manage invoices, payment proofs, and credit activation
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          New Billing
        </button>
      </div>

      {/* Summary tiles */}
      <div className="stats-grid">
        <div className="stat-card stat-card-indigo">
          <div className="stat-label">Total Bills</div>
          <div className="stat-value">{total}</div>
        </div>
        <div className="stat-card stat-card-yellow">
          <div className="stat-label">Pending Approval</div>
          <div className="stat-value">{pending}</div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-label">Approved</div>
          <div className="stat-value">{approved}</div>
        </div>
        <div className="stat-card stat-card-red">
          <div className="stat-label">Rejected</div>
          <div className="stat-value">{rejected}</div>
        </div>
        <div className="stat-card stat-card-blue">
          <div className="stat-label">Revenue Collected</div>
          <div className="stat-value">{formatINR(revenue)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="status-tabs">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`status-tab${statusFilter === s ? " active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "PartiallyPaid" ? "Partial" : s}
            </button>
          ))}
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <Search size={16} />
          <input
            className="search-input"
            placeholder="Search billing #, client, quotation..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setSearch(""); }}
            >
              <X size={14} />
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loader />
      ) : (
        <BillingTable
          billings={billings}
          onUpload={(b) => { setUploadTarget(b); setUploadFile(null); }}
          onApprove={(b) => setApproveTarget(b)}
          onReject={(b) => setRejectTarget(b)}
          onPreview={(b) => setPreviewTarget(b)}
        />
      )}

      {/* ── Create Billing Modal ────────────────────────────────────────── */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Billing</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>
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
              <button className="modal-close" onClick={() => setUploadTarget(null)}>
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