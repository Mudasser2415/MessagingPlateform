import React, { useState } from "react";
import { RefreshCw, XCircle, Search, Filter, PlusCircle } from "lucide-react";
import { Loader } from "../components/Loader";
import { CreditUsageBar } from "../components/CreditUsageBar";
import { ExpiryWarning } from "../components/ExpiryWarning";
import {
  useAllSubscriptions,
  usePlans,
  useAssignSubscription,
  useRenewSubscription,
  useCancelSubscription,
} from "../hooks/useSubscriptions";
import type {
  ClientSubscription,
  AssignSubscriptionRequest,
  PaymentMethod,
} from "../services/subscriptionService";
import { useToastStore } from "../store/toastStore";
import { useQuery } from "@tanstack/react-query";
import { adminClientService } from "../services/adminService";

const STATUS_OPTIONS = ["", "Active", "Expired", "Cancelled", "Pending"];
const PAYMENT_METHODS: PaymentMethod[] = [
  "Cash",
  "UPI",
  "BankTransfer",
  "Razorpay",
  "Stripe",
];

const statusStyle = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
    Expired: { bg: "rgba(239,68,68,0.12)", color: "#dc2626" },
    Cancelled: { bg: "rgba(107,114,128,0.12)", color: "#374151" },
    Pending: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
  };
  return map[status] ?? { bg: "rgba(107,114,128,0.1)", color: "#6b7280" };
};

export const AdminClientSubscriptionsPage: React.FC = () => {
  const addToast = useToastStore((state) => state.addToast);
  const showToast = (msg: string, tone: "success" | "error") =>
    addToast(msg, tone);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data: subscriptions = [], isLoading } = useAllSubscriptions(
    statusFilter || undefined,
    search || undefined,
  );
  const { data: plans = [] } = usePlans(false);
  const { data: clients = [] } = useQuery({
    queryKey: ["admin-clients-for-sub"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const assignMutation = useAssignSubscription();
  const renewMutation = useRenewSubscription();
  const cancelMutation = useCancelSubscription();

  // Assign form state
  const [assignForm, setAssignForm] = useState<AssignSubscriptionRequest>({
    clientId: "",
    subscriptionPlanId: "",
    autoRenew: false,
    paymentMethod: "Cash",
    transactionReference: "",
  });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await assignMutation.mutateAsync(assignForm);
      showToast("Subscription assigned successfully", "success");
      setShowAssignModal(false);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to assign subscription";
      showToast(msg, "error");
    }
  };

  const handleRenew = async (sub: ClientSubscription) => {
    if (!window.confirm(`Renew subscription for ${sub.clientName}?`)) return;
    try {
      await renewMutation.mutateAsync({
        clientSubscriptionId: sub.id,
        paymentMethod: "Cash",
      });
      showToast("Subscription renewed", "success");
    } catch {
      showToast("Renewal failed", "error");
    }
  };

  const handleCancel = async (sub: ClientSubscription) => {
    if (
      !window.confirm(
        `Cancel subscription for ${sub.clientName}? This cannot be undone.`,
      )
    )
      return;
    try {
      await cancelMutation.mutateAsync(sub.id);
      showToast("Subscription cancelled", "success");
    } catch {
      showToast("Cancellation failed", "error");
    }
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.25rem" }}>
            Client Subscriptions
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
            Manage plan assignments, renewals and cancellations
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAssignModal(true)}
        >
          <PlusCircle size={16} /> Assign Plan
        </button>
      </div>

      {/* Filters */}
      <div
        className="stat-card"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Search size={16} style={{ color: "var(--secondary)" }} />
          <input
            className="form-input"
            style={{ flex: 1 }}
            placeholder="Search by client or plan name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Filter size={16} style={{ color: "var(--secondary)" }} />
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: 130 }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s || "All Statuses"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loader label="Loading subscriptions…" />
      ) : subscriptions.length === 0 ? (
        <div
          className="stat-card"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <p style={{ color: "var(--secondary)" }}>No subscriptions found.</p>
        </div>
      ) : (
        <div className="stat-card" style={{ overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(0,0,0,0.03)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {[
                  "Client",
                  "Plan",
                  "Dates",
                  "Credits",
                  "Status",
                  "Auto Renew",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => {
                const used = sub.totalCreditsAllocated - sub.remainingCredits;
                const st = statusStyle(sub.status);
                return (
                  <tr
                    key={sub.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <p style={{ fontWeight: 600 }}>{sub.clientName}</p>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <p style={{ fontWeight: 600 }}>{sub.planName}</p>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {sub.durationType} · ₹{sub.planPrice.toLocaleString()}
                      </p>
                    </td>
                    <td style={{ padding: "0.75rem 1rem", minWidth: 170 }}>
                      <p style={{ fontSize: "0.78rem" }}>
                        {new Date(sub.startDate).toLocaleDateString()} →{" "}
                        {new Date(sub.endDate).toLocaleDateString()}
                      </p>
                      <ExpiryWarning
                        daysUntilExpiry={sub.daysUntilExpiry}
                        isInGracePeriod={sub.isInGracePeriod}
                        gracePeriodDays={sub.gracePeriodDays}
                      />
                    </td>
                    <td style={{ padding: "0.75rem 1rem", minWidth: 180 }}>
                      <CreditUsageBar
                        used={used}
                        total={sub.totalCreditsAllocated}
                      />
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: 999,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "center",
                        fontSize: "0.85rem",
                      }}
                    >
                      {sub.autoRenew ? "✅" : "—"}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        {sub.status !== "Cancelled" && (
                          <>
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Renew"
                              onClick={() => handleRenew(sub)}
                              disabled={renewMutation.isPending}
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                color: "#dc2626",
                                border: "1px solid rgba(239,68,68,0.3)",
                              }}
                              title="Cancel"
                              onClick={() => handleCancel(sub)}
                              disabled={cancelMutation.isPending}
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: 480 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
              Assign Subscription
            </h3>

            <form
              onSubmit={handleAssign}
              style={{ display: "grid", gap: "0.85rem" }}
            >
              <label className="form-label">
                Client *
                <select
                  className="form-input"
                  required
                  value={assignForm.clientId}
                  onChange={(e) =>
                    setAssignForm((p) => ({ ...p, clientId: e.target.value }))
                  }
                >
                  <option value="">Select client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                Plan *
                <select
                  className="form-input"
                  required
                  value={assignForm.subscriptionPlanId}
                  onChange={(e) =>
                    setAssignForm((p) => ({
                      ...p,
                      subscriptionPlanId: e.target.value,
                    }))
                  }
                >
                  <option value="">Select plan…</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.planName} — {p.durationType} — ₹
                      {p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                Start Date
                <input
                  className="form-input"
                  type="date"
                  value={assignForm.startDate ?? ""}
                  onChange={(e) =>
                    setAssignForm((p) => ({
                      ...p,
                      startDate: e.target.value || undefined,
                    }))
                  }
                />
              </label>

              <label className="form-label">
                Payment Method *
                <select
                  className="form-input"
                  value={assignForm.paymentMethod}
                  onChange={(e) =>
                    setAssignForm((p) => ({
                      ...p,
                      paymentMethod: e.target.value as PaymentMethod,
                    }))
                  }
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                Transaction Reference
                <input
                  className="form-input"
                  value={assignForm.transactionReference ?? ""}
                  onChange={(e) =>
                    setAssignForm((p) => ({
                      ...p,
                      transactionReference: e.target.value,
                    }))
                  }
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.875rem",
                }}
              >
                <input
                  type="checkbox"
                  checked={assignForm.autoRenew}
                  onChange={(e) =>
                    setAssignForm((p) => ({
                      ...p,
                      autoRenew: e.target.checked,
                    }))
                  }
                />
                Enable auto-renew
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assignMutation.isPending}
                >
                  Assign Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
