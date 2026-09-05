import React from "react";
import { useRecentMessages } from "../hooks/useMessages";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "sent":
      return { bg: "#10b98115", text: "#10b981" };
    case "pending":
      return { bg: "#f59e0b15", text: "#f59e0b" };
    case "failed":
      return { bg: "#ef444415", text: "#ef4444" };
    default:
      return { bg: "#6b728015", text: "#6b7280" };
  }
};

export const RecentMessagesTable: React.FC = () => {
  const { messages, loading, error } = useRecentMessages(10);

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--secondary)",
        }}
      >
        Loading messages...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444" }}>
        {error}
      </div>
    );
  }

  return (
    <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{ padding: "1.5rem", borderBottom: "1px solid var(--border)" }}
      >
        <h4 style={{ fontWeight: 600 }}>Recent Messages</h4>
      </div>
      <div className="table-scroll-container">
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
                backgroundColor: "var(--card-bg)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <th
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--secondary)",
                  textTransform: "uppercase",
                }}
              >
                Phone Number
              </th>
              <th
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--secondary)",
                  textTransform: "uppercase",
                }}
              >
                Message
              </th>
              <th
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--secondary)",
                  textTransform: "uppercase",
                }}
              >
                Status
              </th>
              <th
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--secondary)",
                  textTransform: "uppercase",
                }}
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "var(--secondary)",
                  }}
                >
                  No recent messages found
                </td>
              </tr>
            ) : (
              messages.map((msg, index) => {
                const statusStyles = getStatusColor(msg.status);
                return (
                  <tr
                    key={msg.id}
                    style={{
                      borderBottom:
                        index === messages.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                      }}
                    >
                      {msg.phoneNumber}
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontSize: "0.875rem",
                        color: "var(--secondary)",
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {msg.messageContent}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.625rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          backgroundColor: statusStyles.bg,
                          color: statusStyles.text,
                          textTransform: "capitalize",
                        }}
                      >
                        {msg.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "1rem 1.5rem",
                        fontSize: "0.875rem",
                        color: "var(--secondary)",
                      }}
                    >
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
