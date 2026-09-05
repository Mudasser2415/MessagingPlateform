import React from "react";
import { useAuthStore } from "../store/authStore";
import { MessageSquare, Send, ArrowDownRight, TrendingUp } from "lucide-react";
import { CreditCard } from "../components/CreditCard";
import { RecentMessagesTable } from "../components/RecentMessagesTable";
import { AssignedClientSelector } from "../components/AssignedClientSelector";

export const DashboardPage: React.FC = () => {
  const { user, selectedClientId } = useAuthStore();

  const stats = [
    {
      label: "Total Messages",
      value: "25,431",
      icon: MessageSquare,
      color: "#6366f1",
    },
    { label: "Sent Messages", value: "24,102", icon: Send, color: "#10b981" },
    {
      label: "Failed Messages",
      value: "432",
      icon: ArrowDownRight,
      color: "#ef4444",
    },
    {
      label: "Pending Messages",
      value: "897",
      icon: TrendingUp,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="welcome-section">
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          Welcome, {user?.name || "User"}
        </h1>
        <p style={{ color: "var(--secondary)", marginTop: "0.25rem" }}>
          {user?.role === "Employee"
            ? "Work is scoped to the assigned client selected in the header."
            : "Here's your messaging overview for today."}
        </p>
      </div>

      {/* Mobile-only: header hides the client selector/user info, so show them
          inline in the page flow (title → client selector → user info → cards). */}
      <div className="mobile-page-info">
        {user?.role === "Employee" && <AssignedClientSelector />}
        <div className="mobile-page-info-user">
          <p style={{ fontWeight: 600 }}>{user?.name}</p>
          <p style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>
            {user?.role}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                <stat.icon size={24} />
              </div>
            </div>
            <p
              style={{
                color: "var(--secondary)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {stat.label}
            </p>
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                marginTop: "0.25rem",
              }}
            >
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div
        className="stack-mobile"
        style={{
          marginTop: "2.5rem",
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: "2rem",
        }}
      >
        <RecentMessagesTable />
        <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
          <CreditCard
            clientId={user?.role === "Employee" ? selectedClientId : null}
            title="Delivery Credits"
            emptyMessage="Select an assigned client in the header to review available credits."
            actionPath="/credits"
          />

          <div className="stat-card" style={{ height: "fit-content" }}>
            <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>
              Recent Activity
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
                • Message sent to Group 'Sales'
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
                • Template 'Promo' updated
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
                • New group 'Dev Team' created
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
