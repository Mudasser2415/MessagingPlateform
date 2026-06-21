import React, { useState } from "react";
import { PlusCircle, Search, X, TrendingUp } from "lucide-react";
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
  const toast = (msg: string, tone: "success" | "error") => addToast(msg, tone);

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<QuotationDto | null>(
    null,
  );

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

  const handleCreate = async (
    data: CreateQuotationRequest | UpdateQuotationRequest,
  ) => {
    try {
      await createMutation.mutateAsync(data as CreateQuotationRequest);
      toast("Quotation created successfully", "success");
      setShowCreate(false);
    } catch (err: unknown) {
      toast(
        err instanceof Error ? err.message : "Failed to create quotation",
        "error",
      );
    }
  };

  const handleUpdate = async (
    data: CreateQuotationRequest | UpdateQuotationRequest,
  ) => {
    if (!editingQuotation) return;
    try {
      await updateMutation.mutateAsync({
        id: editingQuotation.id,
        body: data as UpdateQuotationRequest,
      });
      toast("Quotation updated successfully", "success");
      setEditingQuotation(null);
    } catch (err: unknown) {
      toast(
        err instanceof Error ? err.message : "Failed to update quotation",
        "error",
      );
    }
  };

  const handleApprove = async (q: QuotationDto) => {
    if (
      !window.confirm(
        `Approve quotation ${q.quotationNumber} for ${q.clientName}?\n\nThis will allocate ${q.includedCredits} credits to the client.`,
      )
    )
      return;
    try {
      await approveMutation.mutateAsync(q.id);
      toast(
        `Quotation ${q.quotationNumber} approved — credits allocated`,
        "success",
      );
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Approval failed", "error");
    }
  };

  const handleReject = async (q: QuotationDto) => {
    if (
      !window.confirm(
        `Reject quotation ${q.quotationNumber} for ${q.clientName}?`,
      )
    )
      return;
    try {
      await rejectMutation.mutateAsync(q.id);
      toast(`Quotation ${q.quotationNumber} rejected`, "success");
    } catch (err: unknown) {
      toast(err instanceof Error ? err.message : "Rejection failed", "error");
    }
  };

  const handleView = (q: QuotationDto) => navigate(`/admin/quotations/${q.id}`);

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
                Quotation Directory
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
                Create and manage custom pricing offers for clients.
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
                <PlusCircle size={14} /> New Quotation
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
                {quotations.length} showing
              </div>
            </div>
          </div>

          {summary ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flexWrap: "wrap",
              }}
            >
              {(
                [
                  [
                    "Draft",
                    summary.totalDraft,
                    "rgba(107,114,128,0.1)",
                    "#374151",
                  ],
                  [
                    "Sent",
                    summary.totalSent,
                    "rgba(59,130,246,0.1)",
                    "#1d4ed8",
                  ],
                  [
                    "Approved",
                    summary.totalApproved,
                    "rgba(34,197,94,0.1)",
                    "#15803d",
                  ],
                  [
                    "Rejected",
                    summary.totalRejected,
                    "rgba(239,68,68,0.1)",
                    "#dc2626",
                  ],
                  [
                    "Expired",
                    summary.totalExpired,
                    "rgba(249,115,22,0.1)",
                    "#c2410c",
                  ],
                ] as const
              ).map(([label, count, bg, color]) => (
                <button
                  key={label}
                  type="button"
                  title={`${label}: ${count}`}
                  onClick={() =>
                    setStatusFilter(statusFilter === label ? "" : label)
                  }
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
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: bg,
                      color,
                      fontSize: "0.72rem",
                      fontWeight: 800,
                    }}
                  >
                    {count}
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
                    backgroundColor: "rgba(99,102,241,0.12)",
                  }}
                >
                  <TrendingUp size={13} color="var(--primary)" />
                </span>
                <span style={{ fontSize: "0.78rem", fontWeight: 700 }}>
                  ₹{summary.totalRevenueApproved.toLocaleString()}
                </span>
              </div>
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.6fr) minmax(180px, 0.7fr) auto",
              gap: "0.85rem",
            }}
          >
            <div style={{ position: "relative" }}>
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
                placeholder="Search by client, plan or quotation number"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ marginBottom: 0 }}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s || "All Statuses"}
                </option>
              ))}
            </select>
            {statusFilter || search ? (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setStatusFilter("");
                  setSearch("");
                }}
                style={{ width: "auto", alignSelf: "stretch" }}
              >
                <X size={14} /> Clear
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {isLoading ? (
          <Loader label="Loading quotations…" />
        ) : quotations.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "var(--secondary)",
            }}
          >
            No quotations found. Create one to get started.
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
      </section>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
              Create Quotation
            </h3>
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
        <div
          className="modal-overlay"
          onClick={() => setEditingQuotation(null)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: 560 }}
            onClick={(e) => e.stopPropagation()}
          >
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
