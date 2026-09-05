import React from "react";
import type { CreditTransactionType } from "../services/creditService";

interface ClientOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  clientOptions?: ClientOption[];
  clientId?: string;
  type?: CreditTransactionType | "";
  fromDate?: string;
  toDate?: string;
  pageSize?: number;
  onClientChange?: (value: string) => void;
  onTypeChange: (value: CreditTransactionType | "") => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onPageSizeChange: (value: number) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  clientOptions = [],
  clientId = "",
  type = "",
  fromDate = "",
  toDate = "",
  pageSize = 10,
  onClientChange,
  onTypeChange,
  onFromDateChange,
  onToDateChange,
  onPageSizeChange,
  onReset,
}) => {
  return (
    <div
      className="stat-card filter-bar-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "0.9rem",
        alignItems: "end",
      }}
    >
      {onClientChange ? (
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Client</span>
          <select
            value={clientId}
            onChange={(event) => onClientChange(event.target.value)}
            className="form-input"
          >
            <option value="">All clients</option>
            {clientOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label style={{ display: "grid", gap: "0.45rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Type</span>
        <select
          value={type}
          onChange={(event) =>
            onTypeChange(event.target.value as CreditTransactionType | "")
          }
          className="form-input"
        >
          <option value="">All types</option>
          <option value="Credit">Credit</option>
          <option value="Debit">Debit</option>
        </select>
      </label>

      <label style={{ display: "grid", gap: "0.45rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>From</span>
        <input
          type="date"
          value={fromDate}
          onChange={(event) => onFromDateChange(event.target.value)}
          className="form-input"
        />
      </label>

      <label style={{ display: "grid", gap: "0.45rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>To</span>
        <input
          type="date"
          value={toDate}
          onChange={(event) => onToDateChange(event.target.value)}
          className="form-input"
        />
      </label>

      <label style={{ display: "grid", gap: "0.45rem" }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Rows</span>
        <select
          value={String(pageSize)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="form-input"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </label>

      <button
        type="button"
        onClick={onReset}
        className="filter-bar-reset"
        style={{
          border: "1px solid var(--border)",
          backgroundColor: "var(--card)",
          color: "var(--foreground)",
          padding: "0.78rem 1rem",
          borderRadius: "0.8rem",
          fontWeight: 700,
        }}
      >
        Reset Filters
      </button>
    </div>
  );
};
