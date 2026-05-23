import React from "react";
import { NavLink } from "react-router-dom";
import {
  Coins,
  LayoutDashboard,
  FileText,
  Users,
  Send,
  History,
  BarChart3,
  Settings,
  MessageSquare,
  CalendarClock,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FileText, label: "Templates", path: "/templates" },
    { icon: Users, label: "Groups", path: "/groups" },
    { icon: Send, label: "Send Message", path: "/send" },
    { icon: CalendarClock, label: "Scheduled", path: "/scheduled" },
    { icon: History, label: "History", path: "/history" },
    { icon: BarChart3, label: "Reports", path: "/reports" },
    { icon: Coins, label: "Credits", path: "/credits" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div
          className="auth-logo"
          style={{
            marginBottom: 0,
            justifyContent: "flex-start",
            fontSize: "1.125rem",
            gap: "0.5rem",
            color: "var(--sidebar-logo-color)",
          }}
        >
          <MessageSquare size={12} />
          <span>MessagingPlatform</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
        <NavLink to="/settings" className="nav-link">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};
