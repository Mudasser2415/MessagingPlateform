import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  LifeBuoy,
  Link2,
  LogOut,
  Megaphone,
  SendHorizontal,
  Settings,
  SquareChartGantt,
  Ticket,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useAdminAuthStore } from "../store/adminAuthStore";

const dashboardItem = {
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/admin/dashboard",
};

const menuSections = [
  {
    heading: "Administration",
    icon: Settings,
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
    icon: Megaphone,
    items: [
      { icon: FileText, label: "Templates", path: "/admin/templates" },
      { icon: Users, label: "Contact Groups", path: "/admin/groups" },
      { icon: SendHorizontal, label: "Send Campaign", path: "/admin/send" },
      {
        icon: CalendarClock,
        label: "Scheduled Campaigns",
        path: "/admin/scheduled",
      },
    ],
  },
  {
    heading: "Billing & Subscription",
    icon: Wallet,
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
    icon: BarChart3,
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
    icon: LifeBuoy,
    items: [{ icon: Ticket, label: "Tickets", path: "/admin/tickets" }],
  },
];

export const AdminSidebar: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
}> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuthStore();
  const [openFlyout, setOpenFlyout] = useState<string | null>(null);

  const closeFlyout = (heading: string) =>
    setOpenFlyout((current) => (current === heading ? null : current));

  return (
    <aside
      className={`sidebar admin-sidebar admin-rail ${isOpen ? "sidebar-mobile-open" : ""}`}
    >
      <button
        type="button"
        className="sidebar-close"
        aria-label="Close navigation"
        onClick={onClose}
        style={{ position: "absolute", top: "0.75rem", right: "0.75rem" }}
      >
        <X size={18} />
      </button>
      <nav className="sidebar-nav admin-sidebar-nav admin-rail-nav">
        <NavLink
          key={dashboardItem.path}
          to={dashboardItem.path}
          end
          title={dashboardItem.label}
          onClick={onClose}
          className={({ isActive }) =>
            `admin-rail-item ${isActive ? "active" : ""}`
          }
        >
          <dashboardItem.icon size={18} />
        </NavLink>

        {menuSections.map((section) => {
          const isSectionActive = section.items.some(
            (item) => item.path && location.pathname.startsWith(item.path),
          );

          return (
            <div
              className="admin-rail-group"
              key={section.heading}
              onMouseEnter={() => setOpenFlyout(section.heading)}
              onMouseLeave={() => closeFlyout(section.heading)}
            >
              <button
                type="button"
                title={section.heading}
                className={`admin-rail-item ${isSectionActive ? "active" : ""}`}
                aria-haspopup="true"
                aria-expanded={openFlyout === section.heading}
                onClick={() =>
                  setOpenFlyout((current) =>
                    current === section.heading ? null : section.heading,
                  )
                }
              >
                <section.icon size={18} />
              </button>

              {openFlyout === section.heading && (
                <div className="admin-rail-flyout">
                  <p className="admin-rail-flyout-heading">{section.heading}</p>
                  <div className="admin-rail-flyout-list">
                    {section.items.map((item) =>
                      item.path ? (
                        <NavLink
                          key={item.label}
                          to={item.path}
                          onClick={() => {
                            setOpenFlyout(null);
                            onClose?.();
                          }}
                          className={({ isActive }) =>
                            `admin-rail-flyout-link ${isActive ? "active" : ""}`
                          }
                        >
                          <item.icon size={16} />
                          <span>{item.label}</span>
                        </NavLink>
                      ) : (
                        <div
                          key={item.label}
                          className="admin-rail-flyout-link admin-rail-flyout-link-disabled"
                        >
                          <item.icon size={16} />
                          <span>{item.label}</span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-mobile-footer">
        <div className="sidebar-mobile-user">
          <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {admin?.fullName || "Administrator"}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--sidebar-text)" }}>
            {admin?.role || "Admin"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            onClose?.();
            navigate("/admin/login");
          }}
          className="signout-button"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};
