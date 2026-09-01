import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Settings,
  ArrowUpRight,
  Building2,
  Coins,
  History,
  Link2,
  CalendarRange,
  CreditCard,
  Layers,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Ticket,
  Megaphone,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  adminClientService,
  adminDashboardService,
} from "../services/adminService";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { SubscriptionDashboardWidget } from "../components/SubscriptionDashboardWidget";

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { admin } = useAdminAuthStore();

  const { data: clients = [] } = useQuery({
    queryKey: ["admin-dashboard-clients-count"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => adminDashboardService.getDashboardStats(),
  });

  const statCards = [
    {
      icon: Building2,
      title: "Total Partners",
      value: stats?.totalPartners ?? 0,
      color: "#0f766e",
    },
    {
      icon: Users,
      title: "Total Clients",
      value: stats?.totalClients ?? clients.length,
      color: "#6366f1",
    },
    {
      icon: MessageSquare,
      title: "Messages Sent Today",
      value: stats?.messagesSentToday ?? 0,
      color: "#2563eb",
    },
    {
      icon: CheckCircle2,
      title: "Delivery Rate",
      value: `${stats?.deliveryRate ?? 0}%`,
      color: "#10b981",
    },
    {
      icon: XCircle,
      title: "Failed Messages",
      value: stats?.failedMessagesToday ?? 0,
      color: "#ef4444",
    },
    {
      icon: Ticket,
      title: "Open Tickets",
      value: stats?.openTickets ?? 0,
      color: "#f59e0b",
    },
    {
      icon: Coins,
      title: "Credits Remaining",
      value: stats?.creditsRemaining ?? 0,
      color: "#b45309",
    },
    {
      icon: Megaphone,
      title: "Campaigns Running",
      value: stats?.campaignsRunning ?? 0,
      color: "#7c3aed",
    },
  ];

  const managementModules = [
    {
      icon: Users,
      title: "Client Management",
      description: "View and manage all registered clients",
      area: "Clients",
      state: "Active",
      color: "#6366f1",
      action: () => navigate("/admin/clients"),
    },
    {
      icon: Building2,
      title: "Partner Management",
      description: "Create, search, edit, and disable partner accounts",
      area: "Partners",
      state: "Active",
      color: "#0f766e",
      action: () => navigate("/admin/partners"),
    },
    {
      icon: History,
      title: "Audit Logs",
      description: "Review create, update, and delete activity across entities",
      area: "Security",
      state: "Active",
      color: "#7c3aed",
      action: () => navigate("/admin/audit"),
    },
    {
      icon: CalendarRange,
      title: "Groups",
      description: "Inspect groups across all clients and member snapshots",
      area: "Operations",
      state: "Active",
      color: "#2563eb",
      action: () => navigate("/admin/groups"),
    },
    {
      icon: Link2,
      title: "Client Employee Mapping",
      description: "Assign employees to clients and remove mappings safely",
      area: "Mappings",
      state: "Active",
      color: "#ea580c",
      action: () => navigate("/admin/client-employee-mapping"),
    },
    {
      icon: Coins,
      title: "Credit History",
      description: "Review balance changes, top-ups, and message debits",
      area: "Billing",
      state: "Active",
      color: "#b45309",
      action: () => navigate("/admin/credit-transactions"),
    },
    {
      icon: Layers,
      title: "Subscription Plans",
      description: "Create and manage monthly, quarterly, and yearly plans",
      area: "Subscriptions",
      state: "Active",
      color: "#7c3aed",
      action: () => navigate("/admin/subscription-plans"),
    },
    {
      icon: CreditCard,
      title: "Subscriptions",
      description: "Assign, renew, and cancel client subscriptions",
      area: "Subscriptions",
      state: "Active",
      color: "#0f766e",
      action: () => navigate("/admin/subscriptions"),
    },
    {
      icon: Settings,
      title: "System Settings",
      description: "Configure platform settings",
      area: "Configuration",
      state: "Coming Soon",
      color: "#94a3b8",
      action: undefined,
    },
  ];

  const messageTrendData = (stats?.messageTrend ?? []).map((point) => ({
    ...point,
    label: formatShortDate(point.date),
  }));

  const topClientsData = stats?.topClientsByVolume ?? [];

  const creditUsagePieData = stats
    ? [
        { name: "Credit Used", value: stats.creditUsage.used },
        { name: "Remaining", value: stats.creditUsage.remaining },
      ]
    : [];

  const ticketStatusPieData = stats
    ? [
        { name: "Open", value: stats.ticketStatusSummary.open },
        { name: "Pending", value: stats.ticketStatusSummary.pending },
        { name: "Resolved", value: stats.ticketStatusSummary.resolved },
      ]
    : [];

  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "1rem",
    padding: "1.1rem 1.25rem",
    boxShadow: "var(--shadow)",
  };

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Admin Dashboard
          </h1>
          <p style={{ color: "var(--secondary)" }}>
            Welcome back, {admin?.fullName || "Administrator"}
          </p>
        </div> */}
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
        }}
      >
        {statCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div key={stat.title} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  marginBottom: "0.6rem",
                }}
              >
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "0.6rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${stat.color}18`,
                  }}
                >
                  <IconComponent size={17} color={stat.color} />
                </span>
                <span style={{ color: "var(--secondary)", fontSize: "0.82rem" }}>
                  {stat.title}
                </span>
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 800 }}>
                {statsLoading ? "…" : stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          gap: "1rem",
        }}
      >
        <div style={cardStyle}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.9rem" }}>
            7-Day Message Trend
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={messageTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="sent"
                name="Sent"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="delivered"
                name="Delivered"
                stroke={CHART_COLORS[1]}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.9rem" }}>
            Top 5 Clients by Volume
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={topClientsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="clientName" fontSize={11} hide />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="messageCount" name="Messages" fill={CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.9rem" }}>
            Credit Used vs Remaining
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={creditUsagePieData}
                dataKey="value"
                nameKey="name"
                innerRadius={45}
                outerRadius={75}
              >
                {creditUsagePieData.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={cardStyle}>
          <h3 style={{ fontSize: "1rem", fontWeight: 800, marginBottom: "0.9rem" }}>
            Ticket Status
          </h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={ticketStatusPieData}
                dataKey="value"
                nameKey="name"
                outerRadius={75}
              >
                {ticketStatusPieData.map((entry, index) => (
                  <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Tables Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Recent Campaigns</h3>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Summary</th>
                  <th>Created</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentCampaigns ?? []).map((campaign, index) => (
                  <tr key={`${campaign.title}-${index}`}>
                    <td>{campaign.title}</td>
                    <td>{campaign.summary}</td>
                    <td>{new Date(campaign.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          backgroundColor:
                            campaign.status === "Sent"
                              ? "rgba(16, 185, 129, 0.12)"
                              : campaign.status === "In Progress"
                                ? "rgba(37, 99, 235, 0.12)"
                                : "rgba(239, 68, 68, 0.12)",
                          color:
                            campaign.status === "Sent"
                              ? "#047857"
                              : campaign.status === "In Progress"
                                ? "#1d4ed8"
                                : "#b91c1c",
                        }}
                      >
                        {campaign.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!statsLoading && (stats?.recentCampaigns ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--secondary)" }}>
                      No recent campaigns
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Recent Tickets</h3>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentTickets ?? []).map((ticket) => (
                  <tr key={ticket.ticketNumber}>
                    <td>{ticket.ticketNumber}</td>
                    <td>{ticket.clientName}</td>
                    <td>{new Date(ticket.issueDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          backgroundColor:
                            ticket.status === "Open"
                              ? "rgba(239, 68, 68, 0.12)"
                              : ticket.status === "Resolved" ||
                                  ticket.status === "Closed"
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(245, 158, 11, 0.12)",
                          color:
                            ticket.status === "Open"
                              ? "#b91c1c"
                              : ticket.status === "Resolved" ||
                                  ticket.status === "Closed"
                                ? "#047857"
                                : "#b45309",
                        }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!statsLoading && (stats?.recentTickets ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--secondary)" }}>
                      No recent tickets
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
