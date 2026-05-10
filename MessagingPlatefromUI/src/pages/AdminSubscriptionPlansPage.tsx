import React, { useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { PlanCard } from "../components/PlanCard";
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
            Subscription Plans
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
            Manage available SaaS subscription plans
          </p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <PlusCircle size={16} /> New Plan
        </button>
      </div>

      {/* Search */}
      <div className="stat-card" style={{ display: "flex", gap: "0.5rem" }}>
        <Search size={16} style={{ color: "var(--secondary)", marginTop: 2 }} />
        <input
          className="form-input"
          style={{ flex: 1 }}
          placeholder="Search plans…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Plan grid */}
      {isLoading ? (
        <Loader label="Loading plans…" />
      ) : filtered.length === 0 ? (
        <div
          className="stat-card"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <p style={{ color: "var(--secondary)" }}>No plans found.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={openEdit}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

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
