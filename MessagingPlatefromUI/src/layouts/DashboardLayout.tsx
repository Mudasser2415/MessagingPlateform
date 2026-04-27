import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
