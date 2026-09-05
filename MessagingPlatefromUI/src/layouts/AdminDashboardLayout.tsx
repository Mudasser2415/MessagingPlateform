import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminHeader } from "../components/AdminHeader";

export const AdminDashboardLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="main-layout">
      <AdminSidebar
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div
        className={`sidebar-overlay ${mobileNavOpen ? "sidebar-overlay-visible" : ""}`}
        onClick={() => setMobileNavOpen(false)}
      />
      <main className="main-content">
        <AdminHeader onMenuClick={() => setMobileNavOpen(true)} />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
