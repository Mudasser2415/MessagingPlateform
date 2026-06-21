import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BarChart3,
  Settings,
  Building2,
  Coins,
  History,
  Link2,
  CalendarRange,
  CreditCard,
  Layers,
} from "lucide-react";
import { adminClientService } from "../services/adminService";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { SubscriptionDashboardWidget } from "../components/SubscriptionDashboardWidget";

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuthStore();

  const { data: clients = [] } = useQuery({
    queryKey: ["admin-dashboard-clients-count"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const dashboardStats = [
    {
      icon: Users,
      title: "Total Clients",
      value: String(clients.length),
      color: "#6366f1",
      action: () => navigate("/admin/clients"),
    },
    {
      icon: Building2,
      title: "Partners",
      value: "Manage",
      color: "#0f766e",
      action: () => navigate("/admin/partners"),
    },
    {
      icon: BarChart3,
      title: "System Status",
      value: "Healthy",
      color: "#10b981",
    },
    {
      icon: History,
      title: "Audit Trail",
      value: "Review",
      color: "#7c3aed",
      action: () => navigate("/admin/audit"),
    },
    {
      icon: CalendarRange,
      title: "Groups",
      value: "Inspect",
      color: "#2563eb",
      action: () => navigate("/admin/groups"),
    },
    {
      icon: Link2,
      title: "Client Mapping",
      value: "Assign",
      color: "#ea580c",
      action: () => navigate("/admin/client-employee-mapping"),
    },
    {
      icon: Coins,
      title: "Credits",
      value: "Manage",
      color: "#b45309",
      action: () => navigate("/admin/credits"),
    },
    {
      icon: BarChart3,
      title: "Reports",
      value: "Review",
      color: "#2563eb",
      action: () => navigate("/admin/reports"),
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--secondary)" }}>
            Welcome back, {admin?.fullName || "Administrator"}
          </p>
        </div>
        {/* <button onClick={handleLogout} className="signout-button">
          <LogOut size={16} /> Sign out
        </button> */}
      </div>

      {/* Quick Actions Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          flexWrap: "wrap",
          padding: "0.6rem 0.8rem",
          backgroundColor: "rgba(99, 102, 241, 0.05)",
          border: "1px solid rgba(99, 102, 241, 0.15)",
          borderRadius: "0.75rem",
        }}
      >
        {dashboardStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <button
              key={stat.title}
              onClick={stat.action}
              title={`${stat.title}: ${stat.value}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.25rem 0.35rem",
                borderRadius: "999px",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                cursor: stat.action ? "pointer" : "default",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (stat.action) {
                  e.currentTarget.style.borderColor = stat.color;
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${stat.color}20`;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
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
                  backgroundColor: `${stat.color}18`,
                }}
              >
                <IconComponent size={13} color={stat.color} />
              </span>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  minWidth: "1ch",
                }}
              >
                {stat.value}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation Cards */}
      <div>
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Management
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: "1rem",
            overflowX: "auto",
          }}
        >
          <button
            onClick={() => navigate("/admin/clients")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#6366f1";
              e.currentTarget.style.backgroundColor =
                "rgba(99, 102, 241, 0.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            <Users
              size={26}
              color="#6366f1"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Client Management
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              View and manage all registered clients
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/partners")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0f766e";
              e.currentTarget.style.backgroundColor =
                "rgba(15, 118, 110, 0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            <Building2
              size={26}
              color="#0f766e"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Partner Management
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Create, search, edit, and disable partner accounts
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/audit")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#7c3aed";
              e.currentTarget.style.backgroundColor =
                "rgba(124, 58, 237, 0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            <History
              size={26}
              color="#7c3aed"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Audit Logs
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Review create, update, and delete activity across core entities
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/groups")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.backgroundColor = "rgba(37, 99, 235, 0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            <CalendarRange
              size={26}
              color="#2563eb"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Groups</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Review groups across all clients and inspect membership details
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/client-employee-mapping")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ea580c";
              e.currentTarget.style.backgroundColor = "rgba(234, 88, 12, 0.03)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            <Link2
              size={26}
              color="#ea580c"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Client Employee Mapping
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Assign employees to multiple clients and remove mappings safely
            </p>
          </button>

          <button
            onClick={() => alert("Coming soon")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "not-allowed",
              opacity: 0.6,
              transition: "all 0.2s",
            }}
          >
            <Settings
              size={26}
              color="#94a3b8"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              System Settings
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Configure platform settings (Coming soon)
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/credit-transactions")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#b45309";
              e.currentTarget.style.backgroundColor =
                "rgba(245, 158, 11, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            <Coins
              size={26}
              color="#b45309"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Credit History
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Review balance changes, top-ups, and message debit activity
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/subscription-plans")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#7c3aed";
              e.currentTarget.style.backgroundColor = "rgba(124,58,237,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            <Layers
              size={26}
              color="#7c3aed"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Subscription Plans
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Create and manage monthly, quarterly & yearly plans
            </p>
          </button>

          <button
            onClick={() => navigate("/admin/subscriptions")}
            style={{
              minWidth: 0,
              padding: "1.4rem 1.1rem",
              textAlign: "center",
              backgroundColor: "var(--card)",
              border: "2px solid var(--border)",
              borderRadius: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#0f766e";
              e.currentTarget.style.backgroundColor = "rgba(15,118,110,0.04)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card)";
            }}
          >
            <CreditCard
              size={26}
              color="#0f766e"
              style={{ marginBottom: "0.75rem" }}
            />
            <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>
              Subscriptions
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
              Assign, renew and cancel client subscriptions
            </p>
          </button>
        </div>
      </div>

      {/* Subscription summary widget */}
      <SubscriptionDashboardWidget />
    </div>
  );
};
