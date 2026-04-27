import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminHeader } from "../components/AdminHeader";

export const AdminDashboardLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <AdminSidebar />
      <main className="main-content">
        <AdminHeader />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
