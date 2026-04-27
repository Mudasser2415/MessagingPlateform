import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Search,
  Filter,
  Eye,
  X,
  MessageSquare,
  Calendar,
  Phone,
  Clock,
} from "lucide-react";
import { messageService } from "../services/messageService";
import { Button } from "../components/Button";
import { useAuthStore } from "../store/authStore";

// Types
interface MessageDto {
  id: string;
  clientId: string;
  templateId: string;
  groupId: string | null;
  phoneNumber: string;
  messageContent: string;
  status: string;
  createdAt: string;
  sentAt: string | null;
}

export const MessageHistoryPage: React.FC = () => {
  const { selectedClientId, user } = useAuthStore();
  // Query
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery<MessageDto[]>({
    queryKey: ["messages"],
    queryFn: messageService.getMessages,
  });

  // Filters State
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Local state for active filters (only applied when "Apply Filters" is clicked)
  const [activeFilters, setActiveFilters] = useState({
    status: "All",
    from: "",
    to: "",
    search: "",
  });

  // Modal State
  const [selectedMessage, setSelectedMessage] = useState<MessageDto | null>(
    null,
  );

  // Status Utilities
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "sent":
        return { bg: "#dcfce7", text: "#16a34a", dot: "#22c55e" };
      case "failed":
        return { bg: "#fee2e2", text: "#dc2626", dot: "#ef4444" };
      case "delivered":
        return { bg: "#dbeafe", text: "#2563eb", dot: "#3b82f6" };
      case "pending":
      default:
        return { bg: "#fef3c7", text: "#d97706", dot: "#f59e0b" };
    }
  };

  // Handlers
  const handleApplyFilters = () => {
    setActiveFilters({
      status: statusFilter,
      from: fromDate,
      to: toDate,
      search: searchQuery,
    });
  };

  // Filter Data
  const filteredMessages = messages.filter((msg) => {
    if (
      user?.role === "Employee" &&
      selectedClientId &&
      msg.clientId !== selectedClientId
    ) {
      return false;
    }

    // Status Filter
    if (
      activeFilters.status !== "All" &&
      msg.status.toLowerCase() !== activeFilters.status.toLowerCase()
    ) {
      return false;
    }

    // Date Range Filter
    const msgDate = new Date(msg.createdAt).getTime();
    if (
      activeFilters.from &&
      msgDate < new Date(activeFilters.from).getTime()
    ) {
      return false;
    }
    if (activeFilters.to) {
      // Set to end of the selected day
      const toDateObj = new Date(activeFilters.to);
      toDateObj.setHours(23, 59, 59, 999);
      if (msgDate > toDateObj.getTime()) {
        return false;
      }
    }

    // Search Filter
    if (activeFilters.search) {
      const q = activeFilters.search.toLowerCase();
      const matchPhone = msg.phoneNumber?.toLowerCase().includes(q);
      const matchContent = msg.messageContent?.toLowerCase().includes(q);
      if (!matchPhone && !matchContent) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
          Message History
        </h1>
        <p style={{ color: "var(--secondary)" }}>
          Track, filter, and review all your outbound messages and their
          delivery statuses.
        </p>
      </div>

      {/* ─── FILTERS SECTION ─── */}
      <div className="stat-card" style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <Filter size={18} color="var(--primary)" />
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600 }}>
            Filter Messages
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {/* Status */}
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Search */}
          <div>
            <label className="form-label">Search</label>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--secondary)",
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "2.25rem" }}
                placeholder="Phone or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "1.25rem",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleApplyFilters}
            style={{
              width: "auto",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
            }}
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* ─── TABLE SECTION ─── */}
      <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ fontWeight: 600, fontSize: "1rem" }}>Results</h3>
          <span style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
            Showing {filteredMessages.length} message
            {filteredMessages.length !== 1 && "s"}
          </span>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              color: "var(--secondary)",
            }}
          >
            Loading message history...
          </div>
        ) : isError ? (
          <div
            style={{ padding: "4rem", textAlign: "center", color: "#ef4444" }}
          >
            Failed to load messages. Please try again.
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{ padding: "6rem 2rem", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "var(--background)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                color: "var(--secondary)",
              }}
            >
              <History size={32} />
            </div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              No messages found
            </h3>
            <p style={{ color: "var(--secondary)", fontSize: "0.875rem" }}>
              Try adjusting your filters or send a new message.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "var(--background)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <th
                    style={{
                      padding: "0.875rem 1.5rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--secondary)",
                    }}
                  >
                    Phone Number
                  </th>
                  <th
                    style={{
                      padding: "0.875rem 1.5rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--secondary)",
                    }}
                  >
                    Message Content
                  </th>
                  <th
                    style={{
                      padding: "0.875rem 1.5rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--secondary)",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "0.875rem 1.5rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--secondary)",
                    }}
                  >
                    Sent Date
                  </th>
                  <th
                    style={{
                      padding: "0.875rem 1.5rem",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--secondary)",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg, idx) => {
                  const statusColors = getStatusColor(msg.status);
                  return (
                    <tr
                      key={msg.id}
                      style={{
                        borderBottom:
                          idx === filteredMessages.length - 1
                            ? "none"
                            : "1px solid var(--border)",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--background)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "")
                      }
                    >
                      {/* Phone Number */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <Phone size={14} color="var(--secondary)" />
                          <span
                            style={{ fontWeight: 600, fontSize: "0.875rem" }}
                          >
                            {msg.phoneNumber || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* Content */}
                      <td style={{ padding: "1rem 1.5rem", maxWidth: "300px" }}>
                        <div
                          style={{
                            fontSize: "0.875rem",
                            color: "var(--foreground)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {msg.messageContent || "(Empty)"}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.375rem",
                            padding: "0.25rem 0.625rem",
                            borderRadius: "9999px",
                            backgroundColor: statusColors.bg,
                            color: statusColors.text,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              backgroundColor: statusColors.dot,
                            }}
                          />
                          {msg.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td
                        style={{
                          padding: "1rem 1.5rem",
                          fontSize: "0.875rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </td>

                      {/* Action */}
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            padding: "0.375rem 0.75rem",
                            borderRadius: "0.375rem",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--card)",
                            color: "var(--primary)",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor =
                              "var(--primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                          }}
                        >
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL ─── */}
      {selectedMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            animation: "fadeIn 0.15s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              backgroundColor: "var(--card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "0.5rem",
                    backgroundColor: "rgba(99,102,241,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MessageSquare size={18} color="var(--primary)" />
                </div>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                  Message Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "0.375rem",
                  border: "1px solid var(--border)",
                  background: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--secondary)",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {/* Status Block */}
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "var(--background)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "var(--secondary)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Status
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.25rem 0.625rem",
                      borderRadius: "9999px",
                      backgroundColor: getStatusColor(selectedMessage.status)
                        .bg,
                      color: getStatusColor(selectedMessage.status).text,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: getStatusColor(selectedMessage.status)
                          .dot,
                      }}
                    />
                    {selectedMessage.status}
                  </span>
                </div>

                {/* Phone Block */}
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "var(--background)",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      color: "var(--secondary)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Recipient
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    <Phone size={14} color="var(--primary)" />
                    {selectedMessage.phoneNumber || "N/A"}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.75rem",
                      color: "var(--secondary)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <Calendar size={12} /> Created At
                  </span>
                  <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.75rem",
                      color: "var(--secondary)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <Clock size={12} /> Sent At
                  </span>
                  <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                    {selectedMessage.sentAt
                      ? new Date(selectedMessage.sentAt).toLocaleString()
                      : "Not dispatched yet"}
                  </div>
                </div>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid var(--border)",
                  margin: "0.25rem 0",
                }}
              />

              {/* Content Block */}
              <div>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.75rem",
                    color: "var(--secondary)",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  Message Content
                </span>
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#e5ddd5",
                    borderRadius: "0.5rem",
                    minHeight: "100px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "0.75rem 1rem",
                      borderRadius: "0 0.5rem 0.5rem 0.5rem",
                      display: "inline-block",
                      maxWidth: "90%",
                      boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      color: "#111b21",
                    }}
                  >
                    {selectedMessage.messageContent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
