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
import { ScheduledMessagesPage } from "./pages/ScheduledMessagesPage";
import { MessageHistoryPage } from "./pages/MessageHistoryPage";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { AdminDashboardLayout } from "./layouts/AdminDashboardLayout";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminForgotPasswordPage } from "./pages/AdminForgotPasswordPage";
import { AdminResetPasswordPage } from "./pages/AdminResetPasswordPage";
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
import { AdminSubscriptionPlansPage } from "./pages/AdminSubscriptionPlansPage";
import { AdminQuotationsPage } from "./pages/AdminQuotationsPage";
import { QuotationDetailsPage } from "./pages/QuotationDetailsPage";
import { AdminBillingTransactionsPage } from "./pages/AdminBillingTransactionsPage";
import BillingDetailsPage from "./pages/BillingDetailsPage";
import { AdminTicketsPage } from "./pages/AdminTicketsPage";
import { useAuthStore } from "./store/authStore";
import { useAdminAuthStore } from "./store/adminAuthStore";
import { ToastViewport } from "./components/ToastViewport";

const queryClient = new QueryClient();

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
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
            path="/admin/forgot-password"
            element={<AdminForgotPasswordPage />}
          />
          <Route
            path="/admin/reset-password"
            element={<AdminResetPasswordPage />}
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
            <Route
              path="/admin/subscription-plans"
              element={<AdminSubscriptionPlansPage />}
            />
            <Route path="/admin/quotations" element={<AdminQuotationsPage />} />
            <Route
              path="/admin/quotations/:id"
              element={<QuotationDetailsPage />}
            />
            <Route
              path="/admin/billing"
              element={<AdminBillingTransactionsPage />}
            />
            <Route path="/admin/billing/:id" element={<BillingDetailsPage />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/templates" element={<TemplatesPage />} />
            <Route path="/admin/send" element={<SendMessagePage />} />
            <Route
              path="/admin/scheduled"
              element={<ScheduledMessagesPage />}
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
            <Route path="/scheduled" element={<ScheduledMessagesPage />} />
            <Route path="/history" element={<MessageHistoryPage />} />
            <Route path="/credits" element={<CreditTransactionsPage />} />
            <Route path="/reports" element={<MessageReportsPage />} />
            <Route
              path="/clients"
              element={
                user?.role === "Employee" ? (
                  <AdminClientManagementPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/partners"
              element={
                user?.role === "Employee" ? (
                  <AdminPartnersPage />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/subscription-plans"
              element={<AdminSubscriptionPlansPage />}
            />
            <Route path="/quotations" element={<AdminQuotationsPage />} />
            <Route path="/quotations/:id" element={<QuotationDetailsPage />} />
            <Route path="/billing" element={<AdminBillingTransactionsPage />} />
            <Route path="/billing/:id" element={<BillingDetailsPage />} />
            <Route path="/tickets" element={<AdminTicketsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
