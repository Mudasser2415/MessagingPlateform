import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Search, X } from "lucide-react";
import React, { useMemo, useState } from "react";
import {
  adminAuditService,
  type AuditLogRecord,
} from "../services/adminService";

const entityOptions = ["Client", "Template", "Group", "Partner", "User"];
const actionOptions = ["Create", "Update", "Delete"];

const actionColors: Record<string, string> = {
  Create: "#16a34a",
  Update: "#d97706",
  Delete: "#dc2626",
};

const formatTimestamp = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const parseAuditJson = (value?: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const prettyPrint = (value?: string | null) => {
  const parsed = parseAuditJson(value);
  if (!parsed) {
    return value || "No captured values.";
  }

  return JSON.stringify(parsed, null, 2);
};

export const AdminAuditLogsPage: React.FC = () => {
  const [entityName, setEntityName] = useState("");
  const [action, setAction] = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLog, setSelectedLog] = useState<AuditLogRecord | null>(null);

  const queryKey = useMemo(
    () => [
      "admin-audit-logs",
      entityName,
      action,
      performedBy,
      fromDate,
      toDate,
      page,
      pageSize,
    ],
    [entityName, action, performedBy, fromDate, toDate, page, pageSize],
  );

  const { data, isLoading, isFetching } = useQuery({
    queryKey,
    queryFn: () =>
      adminAuditService.getAuditLogs({
        entityName: entityName || undefined,
        action: action || undefined,
        performedBy: performedBy.trim() || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        page,
        pageSize,
      }),
  });

  const logs = data?.items ?? [];

  const resetFilters = () => {
    setEntityName("");
    setAction("");
    setPerformedBy("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "1.25rem 1.5rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              Audit Directory
            </h2>
            <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
              Search records, narrow by entity and action, then open full change
              details.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: "0 1 auto",
                minWidth: 0,
                overflowWrap: "anywhere",
                padding: "0.45rem 0.8rem",
                borderRadius: "999px",
                backgroundColor: "rgba(99, 102, 241, 0.08)",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {data?.totalCount ?? 0} showing
            </div>
          </div>
        </div>

        <div
          className="stack-mobile grid-cols-tablet-2"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) minmax(170px, 0.7fr) minmax(220px, 1fr) minmax(170px, 0.7fr) minmax(170px, 0.7fr) minmax(150px, 0.6fr)",
            gap: "0.85rem",
          }}
        >
          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Entity</span>
            <select
              className="form-input"
              style={{ marginBottom: 0 }}
              value={entityName}
              onChange={(event) => {
                setEntityName(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All entities</option>
              {entityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Action</span>
            <select
              className="form-input"
              style={{ marginBottom: 0 }}
              value={action}
              onChange={(event) => {
                setAction(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All actions</option>
              {actionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Performed by
            </span>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0.75rem",
                  transform: "translateY(-50%)",
                  color: "var(--secondary)",
                }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: "2.25rem", marginBottom: 0 }}
                value={performedBy}
                onChange={(event) => {
                  setPerformedBy(event.target.value);
                  setPage(1);
                }}
                placeholder="Name or actor id"
              />
            </div>
          </label>

          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              From date
            </span>
            <input
              type="date"
              className="form-input"
              style={{ marginBottom: 0 }}
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              To date
            </span>
            <input
              type="date"
              className="form-input"
              style={{ marginBottom: 0 }}
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setPage(1);
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              Rows per page
            </span>
            <select
              className="form-input"
              style={{ marginBottom: 0 }}
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ color: "var(--secondary)", fontSize: "0.9rem" }}>
            {isFetching
              ? "Refreshing audit records..."
              : `Showing ${logs.length} records on this page.`}
          </p>
          <button
            type="button"
            onClick={resetFilters}
            style={{
              border: "1px solid var(--border)",
              backgroundColor: "transparent",
              borderRadius: "999px",
              padding: "0.5rem 0.9rem",
              fontWeight: 600,
              fontSize: "0.82rem",
            }}
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
          }}
        >
          {isLoading ? (
            <div
              style={{
                padding: "2rem 1.25rem",
                color: "var(--secondary)",
                overflow: "auto",
              }}
            >
              Loading audit logs...
            </div>
          ) : logs.length === 0 ? (
            <div
              style={{
                padding: "2rem 1.25rem",
                color: "var(--secondary)",
                overflow: "auto",
              }}
            >
              No audit activity matched the current filters.
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Entity</th>
                    <th>Action</th>
                    <th>Actor</th>
                    <th>Timestamp</th>
                    <th>Record</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            title="View details"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <p style={{ fontWeight: 700 }}>{log.entityName}</p>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--secondary)",
                          }}
                        >
                          {log.entityId}
                        </p>
                      </td>
                      <td>
                        <span
                          style={{
                            width: "fit-content",
                            padding: "0.25rem 0.55rem",
                            borderRadius: "999px",
                            backgroundColor: `${actionColors[log.action] ?? "#64748b"}18`,
                            color: actionColors[log.action] ?? "#64748b",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                          }}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>
                        <p style={{ fontWeight: 600 }}>{log.performedByName}</p>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--secondary)",
                          }}
                        >
                          {log.performedBy || "System"}
                        </p>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {log.ipAddress || "No IP captured"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.25rem",
              borderTop: "1px solid var(--border)",
              backgroundColor: "rgba(148, 163, 184, 0.04)",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <p style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>
              Total {data?.totalCount ?? 0} records
            </p>

            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  opacity: page <= 1 ? 0.4 : 1,
                }}
              >
                <ChevronLeft size={16} style={{ marginTop: 3 }} />
              </button>
              <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                Page {data?.page ?? page} of{" "}
                {Math.max(data?.totalPages ?? 1, 1)}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    current >= (data?.totalPages ?? 1) ? current : current + 1,
                  )
                }
                disabled={page >= (data?.totalPages ?? 1)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  opacity: page >= (data?.totalPages ?? 1) ? 0.4 : 1,
                }}
              >
                <ChevronRight size={16} style={{ marginTop: 3 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {selectedLog ? (
        <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "1200px",
              maxHeight: "88vh",
              overflowY: "auto",
            }}
          >
            <div className="modal-header">
              <h2>Audit Record Details</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedLog(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--secondary)",
                    textTransform: "uppercase",
                  }}
                >
                  Selected Entry
                </p>
                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    marginTop: "0.35rem",
                  }}
                >
                  {selectedLog.entityName} {selectedLog.action}
                </h2>
                <p style={{ marginTop: "0.35rem", color: "var(--secondary)" }}>
                  {formatTimestamp(selectedLog.timestamp)} by{" "}
                  {selectedLog.performedByName}
                </p>
              </div>

              <div
                className="stack-mobile grid-cols-tablet-2"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "0.75rem",
                }}
              >
                {[
                  ["Entity ID", selectedLog.entityId],
                  ["Action", selectedLog.action],
                  ["Actor ID", selectedLog.performedBy || "System"],
                  ["IP Address", selectedLog.ipAddress || "Not captured"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p
                      style={{ fontSize: "0.78rem", color: "var(--secondary)" }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        wordBreak: "break-word",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="stack-mobile"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Previous values
                  </p>
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      backgroundColor: "rgba(15, 23, 42, 0.04)",
                      borderRadius: "0.85rem",
                      padding: "0.9rem",
                      fontSize: "0.78rem",
                      maxHeight: "320px",
                      overflow: "auto",
                    }}
                  >
                    {prettyPrint(selectedLog.oldValues)}
                  </pre>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                    }}
                  >
                    New values
                  </p>
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      backgroundColor: "rgba(15, 23, 42, 0.04)",
                      borderRadius: "0.85rem",
                      padding: "0.9rem",
                      fontSize: "0.78rem",
                      maxHeight: "320px",
                      overflow: "auto",
                    }}
                  >
                    {prettyPrint(selectedLog.newValues)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
