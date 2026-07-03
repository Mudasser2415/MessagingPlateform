import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Bell, LogOut } from "lucide-react";
import { AssignedClientSelector } from "./AssignedClientSelector";

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Dashboard",
    subtitle:
      "Review activity and work inside the currently selected client context.",
  },
  "/dashboard": {
    title: "Dashboard",
    subtitle:
      "Review activity and work inside the currently selected client context.",
  },
  "/templates": {
    title: "Templates",
    subtitle: "Manage templates for the active assigned client.",
  },
  "/groups": {
    title: "Groups",
    subtitle: "Organize recipients for the active assigned client.",
  },
  "/groups/members": {
    title: "Group Members",
    subtitle: "Add, review, and classify members inside the selected group.",
  },
  "/send": {
    title: "Send Message",
    subtitle: "Send templated messages for the active assigned client.",
  },
  "/history": {
    title: "Message History",
    subtitle: "Review outbound activity for the active assigned client.",
  },
  "/reports": {
    title: "Message Reports",
    subtitle:
      "Analyze delivery performance and export message delivery insights.",
  },
  "/credits": {
    title: "Credits",
    subtitle:
      "Track available balance and message credit consumption by client.",
  },
  "/clients": {
    title: "Clients",
    subtitle: "Browse client profiles and inspect client-level details.",
  },
  "/partners": {
    title: "Partners",
    subtitle: "Browse partner accounts and review partner-level details.",
  },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const activeSection =
    titleMap[location.pathname] ??
    titleMap[
      Object.keys(titleMap).find((path) =>
        location.pathname.startsWith(path),
      ) || "/"
    ];

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
          {activeSection.title}
        </h2>
        <p style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>
          {activeSection.subtitle}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <AssignedClientSelector />

        <button
          className="btn-icon"
          style={{
            background: "none",
            border: "none",
            color: "var(--secondary)",
            cursor: "pointer",
          }}
        >
          <Bell size={20} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            paddingLeft: "1.5rem",
            borderLeft: "1px solid var(--border)",
          }}
        >
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>
              {user?.name}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>
              {user?.role}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
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
