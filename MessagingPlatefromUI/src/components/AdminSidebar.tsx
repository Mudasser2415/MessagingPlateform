import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Building2,
  Coins,
  CreditCard,
  History,
  LayoutDashboard,
  Link2,
  Shield,
  Users,
  Layers,
  Ticket,
} from "lucide-react";
import { useAdminAuthStore } from "../store/adminAuthStore";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Building2, label: "Partners", path: "/admin/partners" },
  { icon: Users, label: "Clients", path: "/admin/clients" },
  { icon: Users, label: "Groups", path: "/admin/groups" },
  {
    icon: Link2,
    label: "Client Mapping",
    path: "/admin/client-employee-mapping",
  },
  { icon: Coins, label: "Credits", path: "/admin/credits" },
  { icon: BarChart3, label: "Reports", path: "/admin/reports" },
  { icon: History, label: "Audit Logs", path: "/admin/audit" },
  {
    icon: History,
    label: "Credit History",
    path: "/admin/credit-transactions",
  },
  {
    icon: Layers,
    label: "Subscriptions Plans",
    path: "/admin/subscription-plans",
  },
  { icon: CreditCard, label: "Quotations", path: "/admin/quotations" },
  { icon: CreditCard, label: "Billing", path: "/admin/billing" },
  { icon: Ticket, label: "Tickets", path: "/admin/tickets" },
];

export const AdminSidebar: React.FC = () => {
  const { admin } = useAdminAuthStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div
          className="auth-logo"
          style={{ marginBottom: 0, justifyContent: "flex-start" }}
        >
          <Shield size={18} />
          <span>Admin Console</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin/dashboard"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginBottom: 0, justifyContent: "flex-start" }}>
        <div
          style={{
            margin: "1rem",
            padding: "1rem",
            borderRadius: "0.75rem",
            background:
              "linear-gradient(180deg, rgba(99, 102, 241, 0.12), rgba(99, 102, 241, 0.04))",
            border: "1px solid rgba(99, 102, 241, 0.18)",
          }}
        >
          <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>
            Signed in as
          </p>
          <p style={{ fontWeight: 700, marginTop: "0.25rem" }}>
            {admin?.fullName || "Administrator"}
          </p>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--secondary)",
              wordBreak: "break-word",
            }}
          >
            {admin?.email}
          </p>
        </div>
      </div>
    </aside>
  );
};
