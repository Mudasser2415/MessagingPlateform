import React from "react";
import type { ReportPageResponse } from "../services/reportService";
import { StatusBadge } from "./StatusBadge";
import { Pagination } from "./Pagination";

interface ReportTableProps {
  data?: ReportPageResponse;
  isLoading?: boolean;
  error?: string | null;
  onPageChange: (page: number) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  data,
  isLoading,
  error,
  onPageChange,
}) => {
  return (
    <section className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
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
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Detailed Report</h3>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--secondary)",
              marginTop: "0.2rem",
            }}
          >
            Delivery activity with server-side pagination and status insights.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div style={{ padding: "1.25rem" }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="report-table-skeleton-row">
              <div className="report-skeleton-line" style={{ width: "18%" }} />
              <div className="report-skeleton-line" style={{ width: "34%" }} />
              <div className="report-skeleton-line" style={{ width: "14%" }} />
              <div className="report-skeleton-line" style={{ width: "16%" }} />
              <div className="report-skeleton-line" style={{ width: "16%" }} />
            </div>
          ))}
        </div>
      ) : error ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
          {error}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="report-empty-state">
          <h4 style={{ fontSize: "1rem", fontWeight: 700 }}>
            No messages found
          </h4>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--secondary)",
              marginTop: "0.35rem",
            }}
          >
            Try widening the date range or removing a status filter.
          </p>
        </div>
      ) : (
        <div style={{ padding: "0 1.25rem 1.1rem" }}>
          <div className="table-scroll-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Phone Number</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Sent Date</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={`${item.phoneNumber}-${item.createdAt}-${index}`}>
                    <td>{item.phoneNumber}</td>
                    <td>
                      <span
                        title={item.messageContent}
                        className="report-message-cell"
                      >
                        {item.messageContent}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>
                      {item.sentAt
                        ? new Date(item.sentAt).toLocaleString()
                        : "Not sent"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
};
