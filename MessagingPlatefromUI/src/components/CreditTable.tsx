import React from "react";
import { Eye } from "lucide-react";
import type { AdminClientDetail } from "../services/adminService";

interface CreditTableProps {
  clients: AdminClientDetail[];
  onViewHistory: (clientId: string) => void;
  onAddCredits: (clientId: string) => void;
}

export const CreditTable: React.FC<CreditTableProps> = ({
  clients,
  onViewHistory,
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
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Client</th>
            <th>Partner</th>
            <th>Mobile</th>
            <th>Location</th>
            <th>Business</th>
            <th>Groups</th>
            <th>Messages</th>
            <th>Credits</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => {
            const isLowCredit = client.availableCredits < 100;

            return (
              <tr key={client.id}>
                <td>
                  <div className="action-buttons">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      title="View credit history"
                      onClick={() => onViewHistory(client.id)}
                    >
                      <Eye size={14} />
                    </button>
                    {/* <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      title="Add credits"
                      onClick={() => onAddCredits(client.id)}
                    >
                      <PlusCircle size={14} />
                    </button> */}
                  </div>
                </td>
                <td style={{ fontWeight: 700 }}>
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
                <td>{client.partnerCompanyName || "Direct"}</td>
                <td>{client.mobileNumber}</td>
                <td>{client.location}</td>
                <td>{client.businessType}</td>
                <td>{client.groupCount}</td>
                <td>{client.messageCount}</td>
                <td style={{ fontWeight: 800 }}>{client.availableCredits}</td>
                <td>
                  <span
                    style={{
                      padding: "0.25rem 0.55rem",
                      borderRadius: "999px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      backgroundColor: isLowCredit
                        ? "rgba(245, 158, 11, 0.16)"
                        : "rgba(16, 185, 129, 0.12)",
                      color: isLowCredit ? "#b45309" : "#166534",
                    }}
                  >
                    {isLowCredit ? "Low Balance" : "Healthy"}
                  </span>
                </td>
                <td>{formatDate(client.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
