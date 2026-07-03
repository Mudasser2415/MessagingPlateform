import React from "react";
import { NavLink } from "react-router-dom";
import {
  Coins,
  CreditCard,
  LayoutDashboard,
  FileText,
  Users,
  Send,
  History,
  BarChart3,
  CalendarClock,
  Layers,
  Ticket,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const dashboardItem = {
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/",
};

const menuSections = [
  {
    heading: "Campaign Management",
    items: [
      { icon: FileText, label: "Templates", path: "/templates" },
      { icon: Users, label: "Contact Groups", path: "/groups" },
      { icon: Send, label: "Send Campaign", path: "/send" },
      {
        icon: CalendarClock,
        label: "Scheduled Campaigns",
        path: "/scheduled",
      },
    ],
  },
  {
    heading: "Analytics & Monitoring",
    items: [
      { icon: BarChart3, label: "Reports", path: "/reports" },
      { icon: History, label: "Message History", path: "/history" },
    ],
  },
  {
    heading: "Billing & Subscription",
    items: [
      {
        icon: Layers,
        label: "Subscription Plans",
        path: "/subscription-plans",
      },
      { icon: CreditCard, label: "Quotations", path: "/quotations" },
      { icon: CreditCard, label: "Billing", path: "/billing" },
      { icon: Coins, label: "Credits", path: "/credits" },
    ],
  },
  {
    heading: "Support Center",
    items: [{ icon: Ticket, label: "Tickets", path: "/tickets" }],
  },
];

export const Sidebar: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isEmployee = user?.role === "Employee";

  const sections = isEmployee
    ? [
        {
          heading: "Administration",
          items: [
            { icon: Users, label: "Clients", path: "/clients" },
            { icon: CreditCard, label: "Partners", path: "/partners" },
          ],
        },
        ...menuSections,
      ]
    : menuSections;

  return (
    <aside className="sidebar admin-sidebar">
      <nav className="sidebar-nav admin-sidebar-nav">
        <NavLink
          key={dashboardItem.path}
          to={dashboardItem.path}
          end
          className={({ isActive }) =>
            `nav-link admin-nav-link ${isActive ? "active" : ""}`
          }
        >
          <dashboardItem.icon size={16} />
          <span>{dashboardItem.label}</span>
        </NavLink>

        {sections.map((section) => (
          <section className="admin-menu-section" key={section.heading}>
            <p className="admin-menu-heading">{section.heading}</p>
            <div className="admin-menu-list">
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link admin-nav-link ${isActive ? "active" : ""}`
                  }
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>

      {/* <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
        <NavLink to="/settings" className="nav-link">
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div> */}
    </aside>
  );
};
