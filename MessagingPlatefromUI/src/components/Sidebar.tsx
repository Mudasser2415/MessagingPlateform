import React, { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  Megaphone,
  Wallet,
  LifeBuoy,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { AssignedClientSelector } from "./AssignedClientSelector";

const dashboardItem = {
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/",
};

const menuSections = [
  {
    heading: "Campaign Management",
    icon: Megaphone,
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
    icon: BarChart3,
    items: [
      { icon: BarChart3, label: "Reports", path: "/reports" },
      { icon: History, label: "Message History", path: "/history" },
    ],
  },
  {
    heading: "Billing & Subscription",
    icon: Wallet,
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
    icon: LifeBuoy,
    items: [{ icon: Ticket, label: "Tickets", path: "/tickets" }],
  },
];

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isEmployee = user?.role === "Employee";
  const [openFlyout, setOpenFlyout] = useState<string | null>(null);

  const closeFlyout = (heading: string) =>
    setOpenFlyout((current) => (current === heading ? null : current));

  const sections = isEmployee
    ? [
        {
          heading: "Administration",
          icon: Settings,
          items: [
            { icon: Users, label: "Clients", path: "/clients" },
            { icon: CreditCard, label: "Partners", path: "/partners" },
          ],
        },
        ...menuSections,
      ]
    : menuSections;

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

        {sections.map((section) => {
          const isSectionActive = section.items.some((item) =>
            location.pathname.startsWith(item.path),
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
                    {section.items.map((item) => (
                      <NavLink
                        key={item.path}
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-mobile-footer">
        {isEmployee && <AssignedClientSelector />}
        <div className="sidebar-mobile-user">
          <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>{user?.name}</p>
          <p style={{ fontSize: "0.75rem", color: "var(--sidebar-text)" }}>
            {user?.role}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            onClose?.();
            navigate("/login");
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
