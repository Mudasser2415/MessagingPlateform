import React, { useState } from "react";
import { PlusCircle, Search, Filter, X, TrendingUp } from "lucide-react";
import { Loader } from "../components/Loader";
import { QuotationTable } from "../components/QuotationTable";
import { QuotationForm } from "../components/QuotationForm";
import {
  useAllQuotations,
  useCreateQuotation,
  useUpdateQuotation,
  useApproveQuotation,
  useRejectQuotation,
  useQuotationSummary,
} from "../hooks/useQuotations";
import type {
  QuotationDto,
  CreateQuotationRequest,
  UpdateQuotationRequest,
} from "../services/quotationService";
import { useToastStore } from "../store/toastStore";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = ["", "Draft", "Sent", "Approved", "Rejected", "Expired"];

export const AdminQuotationsPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((s) => s.addToast);
  const toast = (msg: string, tone: "success" | "error") =>
    addToast(msg, tone);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<QuotationDto | null>(null);

  const { data: quotations = [], isLoading } = useAllQuotations(
    statusFilter || undefined,
    search || undefined,
  );
  const { data: summary } = useQuotationSummary();

  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation();
  const approveMutation = useApproveQuotation();
  const rejectMutation = useRejectQuotation();
  const isActing = approveMutation.isPending || rejectMutation.isPending;

  const handleCreate = async (data: CreateQuotationRequest | UpdateQuotationRequest) => {
    try {
      await createMutation.mutateAsync(data as CreateQuotationRequest);
      toast("Quotation created successfully", "success");
      setShowCreate(false);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to create quotation", "error");
    }
  };

  const handleUpdate = async (data: CreateQuotationRequest | UpdateQuotationRequest) => {
    if (!editingQuotation) return;
    try {
      await updateMutation.mutateAsync({ id: editingQuotation.id, body: data as UpdateQuotationRequest });
      toast("Quotation updated successfully", "success");
      setEditingQuotation(null);
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Failed to update quotation", "error");
    }
  };

  const handleApprove = async (q: QuotationDto) => {
    if (!window.confirm(`Approve quotation ${q.quotationNumber} for ${q.clientName}?\n\nThis will allocate ${q.includedCredits} credits to the client.`)) return;
    try {
      await approveMutation.mutateAsync(q.id);
      toast(`Quotation ${q.quotationNumber} approved — credits allocated`, "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Approval failed", "error");
    }
  };

  const handleReject = async (q: QuotationDto) => {
    if (!window.confirm(`Reject quotation ${q.quotationNumber} for ${q.clientName}?`)) return;
    try {
      await rejectMutation.mutateAsync(q.id);
      toast(`Quotation ${q.quotationNumber} rejected`, "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Rejection failed", "error");
    }
  };

  const handleView = (q: QuotationDto) => navigate(`/admin/quotations/${q.id}`);

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.25rem" }}>Quotations</h2>
          <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
            Create and manage custom pricing offers for clients
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <PlusCircle size={16} /> New Quotation
        </button>
      </div>

      {/* Summary tiles */}
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.75rem" }}>
          {(
            [
              ["Draft", summary.totalDraft, "rgba(107,114,128,0.1)", "#374151"],
              ["Sent", summary.totalSent, "rgba(59,130,246,0.1)", "#1d4ed8"],
              ["Approved", summary.totalApproved, "rgba(34,197,94,0.1)", "#15803d"],
              ["Rejected", summary.totalRejected, "rgba(239,68,68,0.1)", "#dc2626"],
              ["Expired", summary.totalExpired, "rgba(249,115,22,0.1)", "#c2410c"],
            ] as const
          ).map(([label, count, bg, color]) => (
            <div
              key={label}
              className="stat-card"
              style={{ background: bg, padding: "0.85rem", cursor: "pointer" }}
              onClick={() => setStatusFilter(statusFilter === label ? "" : label)}
            >
              <p style={{ fontSize: "0.72rem", color: "var(--secondary)" }}>{label}</p>
              <p style={{ fontWeight: 800, fontSize: "1.4rem", color }}>{count}</p>
            </div>
          ))}
          <div className="stat-card" style={{ padding: "0.85rem", background: "rgba(99,102,241,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "0.2rem" }}>
              <TrendingUp size={13} color="var(--primary)" />
              <p style={{ fontSize: "0.72rem", color: "var(--secondary)" }}>Revenue</p>
            </div>
            <p style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--primary)" }}>
              &#8377;{summary.totalRevenueApproved.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="stat-card" style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <Search size={16} style={{ color: "var(--secondary)", flexShrink: 0 }} />
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="Search by client, plan or quotation number…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Filter size={16} style={{ color: "var(--secondary)", flexShrink: 0 }} />
        <select
          className="form-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ minWidth: 140 }}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || "All Statuses"}</option>
          ))}
        </select>
        {(statusFilter || search) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setStatusFilter(""); setSearch(""); }}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <Loader label="Loading quotations…" />
      ) : quotations.length === 0 ? (
        <div className="stat-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--secondary)" }}>No quotations found. Create one to get started.</p>
        </div>
      ) : (
        <QuotationTable
          quotations={quotations}
          onView={handleView}
          onEdit={setEditingQuotation}
          onApprove={handleApprove}
          onReject={handleReject}
          isActing={isActing}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Create Quotation</h3>
            <QuotationForm
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
              isSubmitting={createMutation.isPending}
            />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingQuotation && (
        <div className="modal-overlay" onClick={() => setEditingQuotation(null)}>
          <div className="modal-content" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
              Edit Quotation — {editingQuotation.quotationNumber}
            </h3>
            <QuotationForm
              initial={editingQuotation}
              onSubmit={handleUpdate}
              onCancel={() => setEditingQuotation(null)}
              isSubmitting={updateMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  );
};
