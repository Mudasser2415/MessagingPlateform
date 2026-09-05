import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  History,
  Search,
  Eye,
  X,
  MessageSquare,
  Calendar,
  Phone,
  Clock,
} from "lucide-react";
import { messageService } from "../services/messageService";
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
      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "grid",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                Message History
              </h2>
              <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                Track delivery status, narrow by date range, and inspect message
                details.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flexWrap: "nowrap",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApplyFilters}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  width: "auto",
                  flex: "0 0 auto",
                  whiteSpace: "nowrap",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                Apply Filters
              </button>
              <div
                style={{
                  flex: "0 0 auto",
                  whiteSpace: "nowrap",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {filteredMessages.length} showing
              </div>
            </div>
          </div>

          <div
            className="stack-mobile grid-cols-tablet-2"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.6fr) minmax(170px, 0.7fr) minmax(170px, 0.7fr) minmax(170px, 0.7fr)",
              gap: "0.85rem",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.9rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--secondary)",
                }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "2.5rem", marginBottom: 0 }}
                placeholder="Search phone or message"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()}
              />
            </div>

            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ marginBottom: 0 }}
            >
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
            </select>

            <input
              type="date"
              className="form-input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <input
              type="date"
              className="form-input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ marginBottom: 0 }}
            />
          </div>
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
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                backgroundColor: "var(--background)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                color: "var(--secondary)",
              }}
            >
              <History size={24} />
            </div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 800,
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
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>Phone</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => {
                  const statusColors = getStatusColor(msg.status);
                  return (
                    <tr key={msg.id}>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="View message"
                            onClick={() => setSelectedMessage(msg)}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>

                      <td>
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

                      <td style={{ maxWidth: "360px" }}>
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

                      <td>
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

                      <td
                        style={{
                          fontSize: "0.84rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

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
                className="stack-mobile"
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
                className="stack-mobile"
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
