import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { useAdminAuthStore } from "../store/adminAuthStore";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/admin/dashboard": {
    title: "Admin Dashboard",
    subtitle: "Monitor platform activity and manage your messaging SaaS.",
  },
  "/admin/partners": {
    title: "Partners",
    subtitle: "Manage partner onboarding, access, and operating status.",
  },
  "/admin/clients": {
    title: "Clients",
    subtitle: "Review client activity across the platform.",
  },
  "/admin/groups": {
    title: "Groups",
    subtitle:
      "Inspect group ownership, client coverage, and membership details.",
  },
  "/admin/client-employee-mapping": {
    title: "Client Employee Mapping",
    subtitle:
      "Assign employees to clients and manage tenant access boundaries.",
  },
  "/admin/audit": {
    title: "Audit Logs",
    subtitle: "Trace critical admin, partner, and platform changes.",
  },
  "/admin/credits": {
    title: "Credits",
    subtitle: "Top up client balances and monitor low-credit accounts.",
  },
  "/admin/reports": {
    title: "Message Reports",
    subtitle:
      "Analyze delivery performance across clients and export operational insights.",
  },
  "/admin/credit-transactions": {
    title: "Credit History",
    subtitle: "Review credit and debit activity with filters and pagination.",
  },
};

export const AdminHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuthStore();

  const activeSection =
    titleMap[location.pathname] ??
    titleMap[
      Object.keys(titleMap).find((path) =>
        location.pathname.startsWith(path),
      ) || "/admin/dashboard"
    ];

  return (
    <header className="dashboard-header" style={{ height: "84px" }}>
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          {activeSection.title}
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>
          {activeSection.subtitle}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          type="button"
          className="btn-icon"
          style={{
            background: "var(--background)",
            border: "1px solid var(--border)",
            color: "var(--secondary)",
            width: 40,
            height: 40,
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bell size={18} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            paddingLeft: "1rem",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 700 }}>
              {admin?.fullName || "Administrator"}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>
              {admin?.role || "Admin"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
            className="signout-button"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};
