import React from "react";
import type { ClientEmployeeMapping } from "../services/mappingService";
import { RemoveButton } from "./RemoveButton";
import { Loader } from "./Loader";

interface MappingRow extends ClientEmployeeMapping {
  businessType?: string;
  partnerId?: string | null;
  partnerCompanyName?: string | null;
  location?: string;
  mobileNumber?: string;
}

interface MappingTableProps {
  rows: MappingRow[];
  isLoading: boolean;
  onRemove: (payload: {
    clientId: string;
    userId: string;
    clientName: string;
    employeeName: string;
  }) => void;
}

export const MappingTable: React.FC<MappingTableProps> = ({
  rows,
  isLoading,
  onRemove,
}) => {
  if (isLoading) {
    return <Loader label="Loading client mappings..." />;
  }

  if (rows.length === 0) {
    return (
      <div
        className="empty-state"
        style={{
          border: "none",
          padding: "3rem",
          textAlign: "center",
          color: "var(--secondary)",
        }}
      >
        No client mappings found.
      </div>
    );
  }

  return (
    <div
      className="table-container"
      style={{ border: "none", boxShadow: "none", borderRadius: 0 }}
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>Actions</th>
            <th>Mapped Employees</th>
            <th>Client</th>
            <th>Partner</th>
            <th>Business</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.clientId}>
              <td style={{ verticalAlign: "middle" }}>
                {row.employees.length === 0 ? (
                  <span
                    style={{ color: "var(--secondary)", fontSize: "0.8rem" }}
                  >
                    No actions
                  </span>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {row.employees.map((employee) => (
                      <div
                        key={employee.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "32px",
                        }}
                      >
                        <RemoveButton
                          onClick={() =>
                            onRemove({
                              clientId: row.clientId,
                              userId: employee.userId,
                              clientName: row.clientName,
                              employeeName: employee.name,
                            })
                          }
                          label=""
                        />
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td style={{ verticalAlign: "middle" }}>
                {row.employees.length === 0 ? (
                  <span
                    style={{ color: "var(--secondary)", fontSize: "0.8rem" }}
                  >
                    No employees assigned
                  </span>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {row.employees.map((employee) => (
                      <div
                        key={employee.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "32px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.25rem 0.65rem",
                            borderRadius: "999px",
                            backgroundColor: "rgba(99, 102, 241, 0.08)",
                            color: "var(--primary)",
                            fontSize: "0.78rem",
                            fontWeight: 700,
                          }}
                        >
                          {employee.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td style={{ verticalAlign: "middle" }}>
                <div style={{ fontWeight: 700 }}>{row.clientName}</div>
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--secondary)",
                    marginTop: "0.2rem",
                  }}
                >
                  {row.location || "No location"}{" "}
                  {row.mobileNumber ? `• ${row.mobileNumber}` : ""}
                </div>
              </td>
              <td style={{ verticalAlign: "middle" }}>
                {row.partnerCompanyName || (
                  <span style={{ color: "var(--secondary)" }}>None</span>
                )}
              </td>
              <td style={{ verticalAlign: "middle" }}>
                {row.businessType || (
                  <span style={{ color: "var(--secondary)" }}>N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
