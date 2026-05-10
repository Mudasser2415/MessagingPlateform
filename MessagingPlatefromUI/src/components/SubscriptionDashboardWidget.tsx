import React from "react";
import { useSubscriptionSummary } from "../hooks/useSubscriptions";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export const SubscriptionDashboardWidget: React.FC = () => {
  const { data: summary, isLoading } = useSubscriptionSummary();

  if (isLoading) {
    return (
      <div className="stat-card" style={{ minHeight: 120 }}>
        <p style={{ color: "var(--secondary)", fontSize: "0.82rem" }}>
          Loading subscription summary…
        </p>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="stat-card" style={{ display: "grid", gap: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Activity size={18} color="var(--primary)" />
        <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>
          Subscription Overview
        </h3>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: "0.75rem",
        }}
      >
        <Tile
          icon={<CheckCircle2 size={16} color="#15803d" />}
          label="Active"
          value={summary.totalActive}
          bg="rgba(34,197,94,0.1)"
        />
        <Tile
          icon={<AlertTriangle size={16} color="#dc2626" />}
          label="Expired"
          value={summary.totalExpired}
          bg="rgba(239,68,68,0.1)"
        />
        <Tile
          icon={<AlertTriangle size={16} color="#f59e0b" />}
          label="Expiring (7d)"
          value={summary.expiringIn7Days}
          bg="rgba(245,158,11,0.1)"
        />
        <Tile
          icon={<TrendingUp size={16} color="#2563eb" />}
          label="Revenue (MoM)"
          value={`₹${summary.totalRevenueThisMonth.toLocaleString()}`}
          bg="rgba(59,130,246,0.1)"
        />
      </div>

      {summary.expiringIn7Days > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.3)",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#b45309",
          }}
        >
          <AlertTriangle size={14} />
          {summary.expiringIn7Days} subscription
          {summary.expiringIn7Days !== 1 ? "s" : ""} expiring within 7 days
        </div>
      )}
    </div>
  );
};

const Tile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number | string;
  bg: string;
}> = ({ icon, label, value, bg }) => (
  <div
    style={{
      background: bg,
      borderRadius: "0.75rem",
      padding: "0.75rem",
      display: "grid",
      gap: "0.35rem",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
      {icon}
      <span style={{ fontSize: "0.72rem", color: "var(--secondary)" }}>
        {label}
      </span>
    </div>
    <p style={{ fontWeight: 700, fontSize: "1.25rem" }}>{value}</p>
  </div>
);
