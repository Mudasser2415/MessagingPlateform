import React from "react";
import type { CreditTransactionListResponse } from "../services/creditService";
import { Loader } from "./Loader";

interface TransactionTableProps {
  data?: CreditTransactionListResponse;
  isLoading?: boolean;
  error?: string | null;
  showClientColumn?: boolean;
  onPageChange: (page: number) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  data,
  isLoading,
  error,
  showClientColumn,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="stat-card" style={{ padding: 0 }}>
        <Loader label="Loading credit transactions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="stat-card"
        style={{ color: "#dc2626", textAlign: "center" }}
      >
        {error}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div
        className="stat-card"
        style={{ color: "var(--secondary)", textAlign: "center" }}
      >
        No credit transactions match the selected filters.
      </div>
    );
  }

  return (
    <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="table-scroll-container">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--background)" }}>
              {showClientColumn ? (
                <th style={headerCellStyle}>Client</th>
              ) : null}
              <th style={headerCellStyle}>Type</th>
              <th style={headerCellStyle}>Amount</th>
              <th style={headerCellStyle}>Balance After</th>
              <th style={headerCellStyle}>Reference</th>
              <th style={headerCellStyle}>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((transaction, index) => {
              const isCredit = transaction.type === "Credit";

              return (
                <tr
                  key={transaction.id}
                  style={{
                    borderBottom:
                      index === data.items.length - 1
                        ? "none"
                        : "1px solid var(--border)",
                  }}
                >
                  {showClientColumn ? (
                    <td style={bodyCellStyle}>{transaction.clientName}</td>
                  ) : null}
                  <td style={bodyCellStyle}>
                    <span
                      style={{
                        padding: "0.25rem 0.55rem",
                        borderRadius: "999px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        backgroundColor: isCredit
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(239, 68, 68, 0.12)",
                        color: isCredit ? "#166534" : "#b91c1c",
                      }}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td style={bodyCellStyle}>{transaction.amount}</td>
                  <td style={bodyCellStyle}>{transaction.balanceAfter}</td>
                  <td style={bodyCellStyle}>{transaction.reference || "-"}</td>
                  <td style={bodyCellStyle}>
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "1rem 1.1rem",
          borderTop: "1px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontSize: "0.8rem",
            color: "var(--secondary)",
            flex: "1 1 200px",
            minWidth: 0,
          }}
        >
          Showing page {data.page} of {Math.max(data.totalPages, 1)} with{" "}
          {data.totalCount} total transactions.
        </p>

        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => onPageChange(data.page - 1)}
            disabled={data.page <= 1}
            style={paginationButtonStyle}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => onPageChange(data.page + 1)}
            disabled={data.page >= data.totalPages}
            style={paginationButtonStyle}
          >
            Next
          </button>
        </div>
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

const paginationButtonStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  backgroundColor: "var(--card)",
  color: "var(--foreground)",
  padding: "0.6rem 0.9rem",
  borderRadius: "0.75rem",
  fontWeight: 700,
};
