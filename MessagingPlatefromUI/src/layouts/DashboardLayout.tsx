import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";

export const DashboardLayout: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="main-layout">
      <Sidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div
        className={`sidebar-overlay ${mobileNavOpen ? "sidebar-overlay-visible" : ""}`}
        onClick={() => setMobileNavOpen(false)}
      />
      <main className="main-content">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
