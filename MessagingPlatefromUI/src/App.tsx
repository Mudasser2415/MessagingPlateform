import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { CreateTemplatePage } from "./pages/CreateTemplatePage";
import { EditTemplatePage } from "./pages/EditTemplatePage";
import { GroupsPage } from "./pages/GroupsPage";
import { GroupMembersPage } from "./pages/GroupMembersPage";
import { SendMessagePage } from "./pages/SendMessagePage";
import { MessageHistoryPage } from "./pages/MessageHistoryPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { UserRegisterPage } from "./pages/UserRegisterPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminClientManagementPage } from "./pages/AdminClientManagementPage";
import { AdminPartnersPage } from "./pages/AdminPartnersPage";
import { AdminAuditLogsPage } from "./pages/AdminAuditLogsPage";
import { AdminGroupsPage } from "./pages/AdminGroupsPage";
import { AdminCreditsPage } from "./pages/AdminCreditsPage";
import { AdminCreditTransactionsPage } from "./pages/AdminCreditTransactionsPage";
import { AdminMessageReportsPage } from "./pages/AdminMessageReportsPage";
import { ClientEmployeeMapping } from "./pages/ClientEmployeeMapping";
import { CreditTransactionsPage } from "./pages/CreditTransactionsPage";
import { MessageReportsPage } from "./pages/MessageReportsPage";
import { useAuthStore } from "./store/authStore";
import { useAdminAuthStore } from "./store/adminAuthStore";
import { ToastViewport } from "./components/ToastViewport";

const queryClient = new QueryClient();

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const admin = useAdminAuthStore((state) => state.admin);
  const isAdminAuthenticated = useAdminAuthStore(
    (state) => state.isAuthenticated,
  );
  const hasAdminAccess =
    isAdminAuthenticated &&
    (admin?.role === "Admin" || admin?.role === "SuperAdmin");

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ToastViewport />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route path="/register" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route
            path="/admin/login"
            element={
              !hasAdminAccess ? (
                <AdminLoginPage />
              ) : (
                <Navigate to="/admin/dashboard" />
              )
            }
          />
          <Route
            path="/admin/register"
            element={
              !hasAdminAccess ? (
                <UserRegisterPage />
              ) : (
                <Navigate to="/admin/dashboard" />
              )
            }
          />
          <Route
            element={
              hasAdminAccess ? (
                <AdminDashboardLayout />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route
              path="/admin/clients"
              element={<AdminClientManagementPage />}
            />
            <Route
              path="/admin/client-employee-mapping"
              element={<ClientEmployeeMapping />}
            />
            <Route path="/admin/groups" element={<AdminGroupsPage />} />
            <Route path="/admin/partners" element={<AdminPartnersPage />} />
            <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
            <Route path="/admin/credits" element={<AdminCreditsPage />} />
            <Route
              path="/admin/reports"
              element={<AdminMessageReportsPage />}
            />
            <Route
              path="/admin/credit-transactions"
              element={<AdminCreditTransactionsPage />}
            />
          </Route>

          {/* Protected Routes */}
          <Route
            element={
              isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/new" element={<CreateTemplatePage />} />
            <Route path="/templates/edit/:id" element={<EditTemplatePage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/members" element={<GroupMembersPage />} />
            <Route path="/send" element={<SendMessagePage />} />
            <Route path="/history" element={<MessageHistoryPage />} />
            <Route path="/credits" element={<CreditTransactionsPage />} />
            <Route path="/reports" element={<MessageReportsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
