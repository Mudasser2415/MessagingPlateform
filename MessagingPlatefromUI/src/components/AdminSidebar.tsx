import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Building2,
  CalendarClock,
  Coins,
  CreditCard,
  FileText,
  History,
  LayoutDashboard,
  Layers,
  Link2,
  SendHorizontal,
  SquareChartGantt,
  Ticket,
  Users,
} from "lucide-react";

const dashboardItem = {
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/admin/dashboard",
};

const menuSections = [
  {
    heading: "Administration",
    items: [
      { icon: Building2, label: "Partners", path: "/admin/partners" },
      { icon: Users, label: "Clients", path: "/admin/clients" },
      {
        icon: Link2,
        label: "Client Mapping",
        path: "/admin/client-employee-mapping",
      },
    ],
  },
  {
    heading: "Campaign Management",
    items: [
      { icon: FileText, label: "Templates" },
      { icon: Users, label: "Contact Groups", path: "/admin/groups" },
      { icon: SendHorizontal, label: "Send Campaign" },
      { icon: CalendarClock, label: "Scheduled Campaigns" },
    ],
  },
  {
    heading: "Billing & Subscription",
    items: [
      {
        icon: Layers,
        label: "Subscription Plans",
        path: "/admin/subscription-plans",
      },
      { icon: CreditCard, label: "Quotations", path: "/admin/quotations" },
      { icon: CreditCard, label: "Billing", path: "/admin/billing" },
      { icon: Coins, label: "Credits", path: "/admin/credits" },
    ],
  },
  {
    heading: "Analytics & Monitoring",
    items: [
      { icon: BarChart3, label: "Reports", path: "/admin/reports" },
      { icon: SquareChartGantt, label: "Audit Logs", path: "/admin/audit" },
      {
        icon: History,
        label: "Credit Usage History",
        path: "/admin/credit-transactions",
      },
    ],
  },
  {
    heading: "Support Center",
    items: [{ icon: Ticket, label: "Tickets", path: "/admin/tickets" }],
  },
];

export const AdminSidebar: React.FC = () => {
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

        {menuSections.map((section) => (
          <section className="admin-menu-section" key={section.heading}>
            <p className="admin-menu-heading">{section.heading}</p>
            <div className="admin-menu-list">
              {section.items.map((item) =>
                item.path ? (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `nav-link admin-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </NavLink>
                ) : (
                  <div
                    key={item.label}
                    className="nav-link admin-nav-link admin-nav-link-disabled"
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </div>
                ),
              )}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
};
