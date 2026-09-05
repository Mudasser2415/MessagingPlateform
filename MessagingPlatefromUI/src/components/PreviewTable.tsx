import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "./Button";

export type PreviewRowStatus = "Valid" | "Invalid" | "Duplicate";

export interface CSVPreviewRow {
  id: string;
  phoneNumber: string;
  normalizedPhoneNumber: string;
  status: PreviewRowStatus;
  reason?: string;
}

interface PreviewTableProps {
  rows: CSVPreviewRow[];
  isSubmitting: boolean;
  onSubmit: () => void;
  onClear: () => void;
}

export const PreviewTable: React.FC<PreviewTableProps> = ({
  rows,
  isSubmitting,
  onSubmit,
  onClear,
}) => {
  const validRows = rows.filter((row) => row.status === "Valid");

  if (rows.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "1rem",
        border: "1px solid var(--border)",
        borderRadius: "1rem",
        padding: "1rem",
        backgroundColor: "rgba(248, 250, 252, 0.7)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ fontSize: "0.96rem", fontWeight: 700 }}>CSV Preview</h3>
          <p style={{ color: "var(--secondary)", fontSize: "0.83rem" }}>
            Review parsed rows before adding valid members to the selected
            group.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "#15803d",
              backgroundColor: "rgba(22, 163, 74, 0.12)",
              borderRadius: 999,
              padding: "0.35rem 0.75rem",
            }}
          >
            {validRows.length} valid
          </span>
          <Button
            type="button"
            variant="outline"
            onClick={onClear}
            style={{ width: "auto", paddingInline: "1rem" }}
          >
            Clear Preview
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            isLoading={isSubmitting}
            disabled={validRows.length === 0 || isSubmitting}
            style={{ width: "auto", paddingInline: "1rem" }}
          >
            Add Valid Members
          </Button>
        </div>
      </div>

      <div className="table-scroll-container">
        <table
          style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th style={headerCellStyle}>Phone Number</th>
              <th style={headerCellStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const tone =
                row.status === "Valid"
                  ? "rgba(22, 163, 74, 0.08)"
                  : row.status === "Duplicate"
                    ? "rgba(245, 158, 11, 0.1)"
                    : "rgba(239, 68, 68, 0.1)";

              return (
                <tr
                  key={row.id}
                  style={{
                    backgroundColor:
                      row.status === "Valid" ? "transparent" : tone,
                    borderBottom:
                      index === rows.length - 1
                        ? "none"
                        : "1px solid var(--border)",
                  }}
                >
                  <td style={bodyCellStyle}>{row.phoneNumber || "-"}</td>
                  <td style={bodyCellStyle}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        fontWeight: 700,
                        color:
                          row.status === "Valid"
                            ? "#15803d"
                            : row.status === "Duplicate"
                              ? "#b45309"
                              : "#b91c1c",
                      }}
                    >
                      {row.status === "Valid" ? (
                        <CheckCircle2 size={15} />
                      ) : row.status === "Duplicate" ? (
                        <ShieldAlert size={15} />
                      ) : (
                        <AlertTriangle size={15} />
                      )}
                      <span>{row.status}</span>
                      {row.reason ? (
                        <span
                          style={{ fontWeight: 500, color: "var(--secondary)" }}
                        >
                          {row.reason}
                        </span>
                      ) : null}
                    </div>
                  </td>
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
  padding: "0.8rem 0.9rem",
  textAlign: "left",
  fontSize: "0.74rem",
  fontWeight: 700,
  color: "var(--secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const bodyCellStyle: React.CSSProperties = {
  padding: "0.9rem",
  fontSize: "0.9rem",
};
