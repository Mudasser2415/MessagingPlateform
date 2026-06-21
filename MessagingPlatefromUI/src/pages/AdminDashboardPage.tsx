import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  BarChart3,
  Settings,
  ArrowUpRight,
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

  const managementModules = [
    {
      icon: Users,
      title: "Client Management",
      description: "View and manage all registered clients",
      area: "Clients",
      state: "Active",
      color: "#6366f1",
      action: () => navigate("/admin/clients"),
    },
    {
      icon: Building2,
      title: "Partner Management",
      description: "Create, search, edit, and disable partner accounts",
      area: "Partners",
      state: "Active",
      color: "#0f766e",
      action: () => navigate("/admin/partners"),
    },
    {
      icon: History,
      title: "Audit Logs",
      description: "Review create, update, and delete activity across entities",
      area: "Security",
      state: "Active",
      color: "#7c3aed",
      action: () => navigate("/admin/audit"),
    },
    {
      icon: CalendarRange,
      title: "Groups",
      description: "Inspect groups across all clients and member snapshots",
      area: "Operations",
      state: "Active",
      color: "#2563eb",
      action: () => navigate("/admin/groups"),
    },
    {
      icon: Link2,
      title: "Client Employee Mapping",
      description: "Assign employees to clients and remove mappings safely",
      area: "Mappings",
      state: "Active",
      color: "#ea580c",
      action: () => navigate("/admin/client-employee-mapping"),
    },
    {
      icon: Coins,
      title: "Credit History",
      description: "Review balance changes, top-ups, and message debits",
      area: "Billing",
      state: "Active",
      color: "#b45309",
      action: () => navigate("/admin/credit-transactions"),
    },
    {
      icon: Layers,
      title: "Subscription Plans",
      description: "Create and manage monthly, quarterly, and yearly plans",
      area: "Subscriptions",
      state: "Active",
      color: "#7c3aed",
      action: () => navigate("/admin/subscription-plans"),
    },
    {
      icon: CreditCard,
      title: "Subscriptions",
      description: "Assign, renew, and cancel client subscriptions",
      area: "Subscriptions",
      state: "Active",
      color: "#0f766e",
      action: () => navigate("/admin/subscriptions"),
    },
    {
      icon: Settings,
      title: "System Settings",
      description: "Configure platform settings",
      area: "Configuration",
      state: "Coming Soon",
      color: "#94a3b8",
      action: undefined,
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              Management Directory
            </h2>
            <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
              Open core admin modules from a single compact control surface.
            </p>
          </div>
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
            {managementModules.length} modules
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Actions</th>
                <th>Module</th>
                <th>Area</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {managementModules.map((module) => {
                const Icon = module.icon;
                return (
                  <tr key={module.title}>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title={
                            module.action
                              ? `Open ${module.title}`
                              : "Coming soon"
                          }
                          onClick={() => module.action?.()}
                          disabled={!module.action}
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.55rem",
                        }}
                      >
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "999px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: `${module.color}18`,
                          }}
                        >
                          <Icon size={13} color={module.color} />
                        </span>
                        <span style={{ fontWeight: 700 }}>{module.title}</span>
                      </div>
                    </td>
                    <td>{module.area}</td>
                    <td>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          backgroundColor:
                            module.state === "Active"
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(148, 163, 184, 0.18)",
                          color:
                            module.state === "Active" ? "#047857" : "#475569",
                        }}
                      >
                        {module.state}
                      </span>
                    </td>
                    <td>{module.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Subscription summary widget */}
      <SubscriptionDashboardWidget />
    </div>
  );
};
