import React, { useState } from "react";
import { Pencil, PlusCircle, Power, Search } from "lucide-react";
import { Loader } from "../components/Loader";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
} from "../hooks/useSubscriptions";
import type {
  SubscriptionPlan,
  CreatePlanRequest,
  DurationType,
} from "../services/subscriptionService";
import { useToastStore } from "../store/toastStore";

const DURATION_OPTIONS: DurationType[] = [
  "Monthly",
  "Quarterly",
  "HalfYearly",
  "Yearly",
];

const emptyForm = (): CreatePlanRequest => ({
  planName: "",
  description: "",
  durationType: "Monthly",
  price: 0,
  includedCredits: 0,
  gracePeriodDays: 0,
  isTrial: false,
  maxUsers: null,
  maxGroups: null,
  maxTemplates: null,
});

export const AdminSubscriptionPlansPage: React.FC = () => {
  const { data: plans = [], isLoading } = usePlans(true);
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const addToast = useToastStore((state) => state.addToast);
  const showToast = (msg: string, tone: "success" | "error") =>
    addToast(msg, tone);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [form, setForm] = useState<CreatePlanRequest>(emptyForm());

  const filtered = plans.filter((p) =>
    p.planName.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingPlan(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setForm({
      planName: plan.planName,
      description: plan.description,
      durationType: plan.durationType,
      price: plan.price,
      includedCredits: plan.includedCredits,
      gracePeriodDays: plan.gracePeriodDays,
      isTrial: plan.isTrial,
      maxUsers: plan.maxUsers ?? null,
      maxGroups: plan.maxGroups ?? null,
      maxTemplates: plan.maxTemplates ?? null,
    });
    setShowForm(true);
  };

  const handleToggle = async (plan: SubscriptionPlan) => {
    try {
      await updateMutation.mutateAsync({
        id: plan.id,
        body: {
          ...plan,
          durationType: plan.durationType,
          isActive: !plan.isActive,
        },
      });
      showToast(
        `Plan ${!plan.isActive ? "enabled" : "disabled"} successfully`,
        "success",
      );
    } catch {
      showToast("Failed to update plan", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updateMutation.mutateAsync({
          id: editingPlan.id,
          body: { ...form, isActive: editingPlan.isActive },
        });
        showToast("Plan updated successfully", "success");
      } else {
        await createMutation.mutateAsync(form);
        showToast("Plan created successfully", "success");
      }
      setShowForm(false);
    } catch {
      showToast("Failed to save plan", "error");
    }
  };

  const f = (field: Partial<CreatePlanRequest>) =>
    setForm((prev) => ({ ...prev, ...field }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);

  const getLimitText = (value?: number | null) =>
    value ? String(value) : "Unlimited";

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
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
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div>
              <h2 style={{ fontWeight: 800, fontSize: "1.15rem" }}>
                Subscription Directory
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
                Manage available SaaS subscription plans and pricing rules.
              </p>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
            >
              <button
                className="btn btn-primary"
                onClick={openCreate}
                style={{
                  width: "auto",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                <PlusCircle size={14} /> New Plan
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
                {filtered.length} showing
              </div>
            </div>
          </div>

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
              placeholder="Search plans by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <Loader label="Loading plans…" />
        ) : filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              color: "var(--secondary)",
            }}
          >
            No plans found.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>Plan</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Credits</th>
                  <th>Limits</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="Edit plan"
                          onClick={() => openEdit(plan)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title={plan.isActive ? "Disable plan" : "Enable plan"}
                          onClick={() => handleToggle(plan)}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>{plan.planName}</div>
                      <div
                        style={{
                          marginTop: "0.2rem",
                          fontSize: "0.75rem",
                          color: "var(--secondary)",
                          maxWidth: "360px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {plan.description || "No description"}
                      </div>
                    </td>
                    <td>{plan.durationType}</td>
                    <td>{formatCurrency(plan.price)}</td>
                    <td>{plan.includedCredits.toLocaleString("en-IN")}</td>
                    <td
                      style={{ fontSize: "0.8rem", color: "var(--secondary)" }}
                    >
                      U:{getLimitText(plan.maxUsers)} / G:
                      {getLimitText(plan.maxGroups)} / T:
                      {getLimitText(plan.maxTemplates)}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          backgroundColor: plan.isActive
                            ? "rgba(16, 185, 129, 0.12)"
                            : "rgba(239, 68, 68, 0.12)",
                          color: plan.isActive ? "#047857" : "#b91c1c",
                        }}
                      >
                        {plan.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 520 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
              {editingPlan ? "Edit Plan" : "Create Subscription Plan"}
            </h3>

            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: "0.9rem" }}
            >
              <label className="form-label">
                Plan Name *
                <input
                  className="form-input"
                  required
                  value={form.planName}
                  onChange={(e) => f({ planName: e.target.value })}
                />
              </label>

              <label className="form-label">
                Description
                <textarea
                  className="form-input"
                  rows={2}
                  value={form.description}
                  onChange={(e) => f({ description: e.target.value })}
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <label className="form-label">
                  Duration *
                  <select
                    className="form-input"
                    value={form.durationType}
                    onChange={(e) =>
                      f({ durationType: e.target.value as DurationType })
                    }
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-label">
                  Price (₹) *
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    required
                    value={form.price}
                    onChange={(e) => f({ price: Number(e.target.value) })}
                  />
                </label>

                <label className="form-label">
                  Included Credits *
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    required
                    value={form.includedCredits}
                    onChange={(e) =>
                      f({ includedCredits: Number(e.target.value) })
                    }
                  />
                </label>

                <label className="form-label">
                  Grace Period (days)
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={30}
                    value={form.gracePeriodDays}
                    onChange={(e) =>
                      f({ gracePeriodDays: Number(e.target.value) })
                    }
                  />
                </label>

                <label className="form-label">
                  Max Users
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={form.maxUsers ?? ""}
                    onChange={(e) =>
                      f({
                        maxUsers: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </label>

                <label className="form-label">
                  Max Groups
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    value={form.maxGroups ?? ""}
                    onChange={(e) =>
                      f({
                        maxGroups: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </label>
              </div>

              <label className="form-label">
                Max Templates
                <input
                  className="form-input"
                  type="number"
                  min={1}
                  value={form.maxTemplates ?? ""}
                  onChange={(e) =>
                    f({
                      maxTemplates: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
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
                  checked={form.isTrial}
                  onChange={(e) => f({ isTrial: e.target.checked })}
                />
                This is a trial plan
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
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
