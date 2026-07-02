import React from "react";
import type { ReportFilters, ReportStatus } from "../services/reportService";

export interface ReportClientOption {
  value: string;
  label: string;
}

interface ReportFilterBarProps {
  title?: string;
  subtitle?: string;
  embedded?: boolean;
  filters: ReportFilters;
  clients: ReportClientOption[];
  showClientFilter?: boolean;
  disableClientSelection?: boolean;
  pageSize: number;
  isApplying?: boolean;
  onChange: (next: ReportFilters) => void;
  onApply: () => void;
  onReset: () => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  title = "Filters",
  subtitle = "Refine report data by client, status, and date range.",
  embedded = false,
  filters,
  clients,
  showClientFilter = true,
  disableClientSelection,
  pageSize,
  isApplying,
  onChange,
  onApply,
  onReset,
  onPageSizeChange,
}) => {
  const setValue = <K extends keyof ReportFilters>(
    key: K,
    value: ReportFilters[K],
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const Wrapper: React.ElementType = embedded ? "div" : "section";

  return (
    <Wrapper
      className={embedded ? undefined : "stat-card"}
      style={{ display: "grid", gap: "1rem" }}
    >
      {title || subtitle ? (
        <div>
          {title ? (
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{title}</h3>
          ) : null}
          {subtitle ? (
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--secondary)",
                marginTop: "0.2rem",
              }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="report-filter-grid">
        {showClientFilter ? (
          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span className="report-filter-label">Client</span>
            <select
              value={filters.clientId || ""}
              onChange={(event) => setValue("clientId", event.target.value)}
              className="form-input"
              disabled={disableClientSelection}
            >
              <option value="">All clients</option>
              {clients.map((client) => (
                <option key={client.value} value={client.value}>
                  {client.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span className="report-filter-label">Status</span>
          <select
            value={filters.status || ""}
            onChange={(event) =>
              setValue("status", event.target.value as ReportStatus | "")
            }
            className="form-input"
          >
            <option value="">All statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>
        </label>

        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span className="report-filter-label">From</span>
          <input
            type="date"
            value={filters.fromDate || ""}
            onChange={(event) => setValue("fromDate", event.target.value)}
            className="form-input"
          />
        </label>

        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span className="report-filter-label">To</span>
          <input
            type="date"
            value={filters.toDate || ""}
            onChange={(event) => setValue("toDate", event.target.value)}
            className="form-input"
          />
        </label>

        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span className="report-filter-label">Rows</span>
          <select
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="form-input"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={onReset}
          className="report-secondary-button"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={onApply}
          className="report-primary-button"
          disabled={isApplying}
        >
          {isApplying ? "Applying..." : "Apply"}
        </button>
      </div>
    </Wrapper>
  );
};
