import React from "react";
import type { SubscriptionPlan } from "../services/subscriptionService";
import { CheckCircle2, XCircle } from "lucide-react";

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit?: (plan: SubscriptionPlan) => void;
  onToggle?: (plan: SubscriptionPlan) => void;
}

const durationLabel: Record<string, string> = {
  Monthly: "1 Month",
  Quarterly: "3 Months",
  HalfYearly: "6 Months",
  Yearly: "1 Year",
};

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onEdit,
  onToggle,
}) => {
  return (
    <div
      className="stat-card"
      style={{
        opacity: plan.isActive ? 1 : 0.6,
        borderLeft: `4px solid ${plan.isActive ? "var(--primary)" : "var(--secondary)"}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>{plan.planName}</h3>
          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--secondary)",
              marginTop: "0.15rem",
            }}
          >
            {plan.description}
          </p>
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "0.2rem 0.6rem",
            borderRadius: 999,
            background: plan.isActive
              ? "rgba(34,197,94,0.12)"
              : "rgba(239,68,68,0.12)",
            color: plan.isActive ? "#15803d" : "#dc2626",
          }}
        >
          {plan.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div
        className="stack-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <Stat
          label="Duration"
          value={durationLabel[plan.durationType] ?? plan.durationType}
        />
        <Stat label="Price" value={`₹${plan.price.toLocaleString()}`} />
        <Stat label="Credits" value={plan.includedCredits.toLocaleString()} />
        <Stat label="Grace Period" value={`${plan.gracePeriodDays} days`} />
        {plan.isTrial && (
          <div
            style={{
              gridColumn: "1/-1",
              fontSize: "0.72rem",
              color: "#7c3aed",
              fontWeight: 600,
            }}
          >
            ✦ Trial Plan
          </div>
        )}
      </div>

      {(plan.maxUsers || plan.maxGroups || plan.maxTemplates) && (
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            fontSize: "0.73rem",
            color: "var(--secondary)",
            marginBottom: "0.75rem",
          }}
        >
          {plan.maxUsers && <span>Max Users: {plan.maxUsers}</span>}
          {plan.maxGroups && <span>Max Groups: {plan.maxGroups}</span>}
          {plan.maxTemplates && <span>Max Templates: {plan.maxTemplates}</span>}
        </div>
      )}

      <div style={{ display: "flex", gap: "0.6rem" }}>
        {onEdit && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onEdit(plan)}
          >
            Edit
          </button>
        )}
        {onToggle && (
          <button
            className="btn btn-sm"
            style={{
              background: plan.isActive
                ? "rgba(239,68,68,0.1)"
                : "rgba(34,197,94,0.1)",
              color: plan.isActive ? "#dc2626" : "#15803d",
              border: `1px solid ${plan.isActive ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
            }}
            onClick={() => onToggle(plan)}
          >
            {plan.isActive ? (
              <>
                <XCircle size={14} /> Disable
              </>
            ) : (
              <>
                <CheckCircle2 size={14} /> Enable
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p style={{ fontSize: "0.7rem", color: "var(--secondary)" }}>{label}</p>
    <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{value}</p>
  </div>
);
