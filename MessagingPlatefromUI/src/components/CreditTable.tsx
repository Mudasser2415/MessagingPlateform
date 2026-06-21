import React from "react";
import { PlusCircle } from "lucide-react";
import type { AdminClientDetail } from "../services/adminService";

interface CreditTableProps {
  clients: AdminClientDetail[];
  onAddCredits: (clientId: string) => void;
}

export const CreditTable: React.FC<CreditTableProps> = ({
  clients,
  onAddCredits,
}) => {
  if (clients.length === 0) {
    return (
      <div
        className="stat-card"
        style={{ textAlign: "center", color: "var(--secondary)" }}
      >
        No clients found for credit management.
      </div>
    );
  }

  return (
    <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.1rem 1.25rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
            Client Credit Balances
          </h3>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--secondary)",
              marginTop: "0.2rem",
            }}
          >
            Review current balances and top up client accounts.
          </p>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--background)" }}>
              <th style={headerCellStyle}>Actions</th>
              <th style={headerCellStyle}>Client</th>
              <th style={headerCellStyle}>Partner</th>
              <th style={headerCellStyle}>Credits</th>
              <th style={headerCellStyle}>Groups</th>
              <th style={headerCellStyle}>Messages</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => {
              const isLowCredit = client.availableCredits < 100;

              return (
                <tr
                  key={client.id}
                  style={{
                    borderBottom:
                      index === clients.length - 1
                        ? "none"
                        : "1px solid var(--border)",
                  }}
                >
                  <td style={bodyCellStyle}>
                    <button
                      type="button"
                      onClick={() => onAddCredits(client.id)}
                      style={{
                        border: "1px solid rgba(99, 102, 241, 0.28)",
                        backgroundColor: "rgba(99, 102, 241, 0.08)",
                        color: "#4338ca",
                        padding: "0.55rem 0.8rem",
                        borderRadius: "0.75rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        fontWeight: 700,
                      }}
                    >
                      <PlusCircle size={14} />
                      Add Credits
                    </button>
                  </td>
                  <td style={bodyCellStyle}>
                    <div>
                      <p style={{ fontWeight: 700 }}>{client.name}</p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--secondary)",
                          marginTop: "0.15rem",
                        }}
                      >
                        {client.email}
                      </p>
                    </div>
                  </td>
                  <td style={bodyCellStyle}>
                    {client.partnerCompanyName || "Direct"}
                  </td>
                  <td style={bodyCellStyle}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                      }}
                    >
                      <span style={{ fontWeight: 800, fontSize: "1rem" }}>
                        {client.availableCredits}
                      </span>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: isLowCredit ? "#92400e" : "#166534",
                          backgroundColor: isLowCredit
                            ? "rgba(245, 158, 11, 0.12)"
                            : "rgba(16, 185, 129, 0.12)",
                        }}
                      >
                        {isLowCredit ? "Low" : "Healthy"}
                      </span>
                    </div>
                  </td>
                  <td style={bodyCellStyle}>{client.groupCount}</td>
                  <td style={bodyCellStyle}>{client.messageCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const headerCellStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "0.9rem 1.1rem",
  fontSize: "0.74rem",
  fontWeight: 700,
  color: "var(--secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const bodyCellStyle: React.CSSProperties = {
  padding: "1rem 1.1rem",
  fontSize: "0.88rem",
  verticalAlign: "middle",
};
