import React from "react";
import type { ClientEmployeeMapping } from "../services/mappingService";
import { RemoveButton } from "./RemoveButton";
import { Loader } from "./Loader";

interface MappingTableProps {
  rows: ClientEmployeeMapping[];
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
        style={{
          padding: "3rem",
          textAlign: "center",
          color: "var(--secondary)",
        }}
      >
        No clients available for mapping yet.
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr
            style={{
              backgroundColor: "var(--background)",
              borderBottom: "1px solid var(--border)",
              textAlign: "left",
            }}
          >
            <th style={headerCell}>Client Name</th>
            <th style={headerCell}>Employees</th>
            <th style={headerCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.clientId}
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <td style={bodyCell}>
                <div style={{ fontWeight: 700 }}>{row.clientName}</div>
                <div style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>
                  {row.employees.length} employee
                  {row.employees.length === 1 ? "" : "s"} assigned
                </div>
              </td>
              <td style={bodyCell}>
                {row.employees.length === 0 ? (
                  <span
                    style={{ color: "var(--secondary)", fontSize: "0.875rem" }}
                  >
                    No employees assigned
                  </span>
                ) : (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {row.employees.map((employee) => (
                      <span
                        key={employee.userId}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          padding: "0.45rem 0.75rem",
                          borderRadius: "999px",
                          backgroundColor: "rgba(99, 102, 241, 0.08)",
                          color: "var(--primary)",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                        }}
                      >
                        {employee.name}
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td style={bodyCell}>
                {row.employees.length === 0 ? (
                  <span
                    style={{ color: "var(--secondary)", fontSize: "0.875rem" }}
                  >
                    No actions available
                  </span>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.6rem",
                    }}
                  >
                    {row.employees.map((employee) => (
                      <div
                        key={employee.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "1rem",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--secondary)",
                          }}
                        >
                          {employee.name}
                        </span>
                        <RemoveButton
                          onClick={() =>
                            onRemove({
                              clientId: row.clientId,
                              userId: employee.userId,
                              clientName: row.clientName,
                              employeeName: employee.name,
                            })
                          }
                          label="Remove"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const headerCell: React.CSSProperties = {
  padding: "0.95rem 1.2rem",
  fontSize: "0.72rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--secondary)",
};

const bodyCell: React.CSSProperties = {
  padding: "1rem 1.2rem",
  verticalAlign: "top",
};
