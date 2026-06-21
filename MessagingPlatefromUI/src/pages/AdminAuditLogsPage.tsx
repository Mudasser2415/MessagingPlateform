import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  History,
  Search,
  ShieldCheck,
} from "lucide-react";
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

  useEffect(() => {
    if (logs.length === 0) {
      setSelectedLog(null);
      return;
    }

    setSelectedLog(
      (current) => logs.find((log) => log.id === current?.id) ?? logs[0],
    );
  }, [logs]);

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
          padding: "0.85rem 1rem",
          borderRadius: "0.8rem",
          background:
            "linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(15, 23, 42, 0.03))",
          border: "1px solid rgba(124, 58, 237, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7c3aed",
              marginBottom: "0.2rem",
            }}
          >
            Security & Governance
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>
            Audit Logs
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
            marginLeft: "auto",
          }}
        >
          {[
            {
              icon: History,
              label: "Total Results",
              value: data?.totalCount ?? 0,
              color: "#7c3aed",
            },
            {
              icon: Activity,
              label: "Current Page",
              value: data?.page ?? page,
              color: "#0f766e",
            },
            {
              icon: ShieldCheck,
              label: "Page Size",
              value: data?.pageSize ?? pageSize,
              color: "#2563eb",
            },
            {
              icon: CalendarRange,
              label: "Selected Range",
              value: fromDate || toDate ? "Custom" : "All Time",
              color: "#d97706",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                title={`${card.label}: ${card.value}`}
                aria-label={`${card.label}: ${card.value}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.35rem",
                  borderRadius: "999px",
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${card.color}18`,
                  }}
                >
                  <Icon size={13} color={card.color} />
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    minWidth: "1ch",
                  }}
                >
                  {card.value}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "1.5rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Entity</span>
            <select
              className="form-input"
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
              padding: "0.65rem 1rem",
              fontWeight: 600,
            }}
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            overflow: "hidden",
            maxHeight: "620px",
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.8fr 0.9fr 1fr 1fr",
              gap: "1rem",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--secondary)",
            }}
          >
            <span>Entity</span>
            <span>Action</span>
            <span>Actor</span>
            <span>Timestamp</span>
            <span>Record</span>
          </div>

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
            <div style={{ overflow: "auto" }}>
              {logs.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => setSelectedLog(log)}
                  style={{
                    width: "100%",
                    border: "none",
                    borderTop: "1px solid var(--border)",
                    backgroundColor:
                      selectedLog?.id === log.id
                        ? "rgba(124, 58, 237, 0.06)"
                        : "transparent",
                    padding: "0.8rem 1.25rem",
                    textAlign: "left",
                    display: "grid",
                    gridTemplateColumns: "1.1fr 0.8fr 0.9fr 1fr 1fr",
                    gap: "0.85rem",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700 }}>{log.entityName}</p>
                    <p
                      style={{ fontSize: "0.8rem", color: "var(--secondary)" }}
                    >
                      {log.entityId}
                    </p>
                  </div>
                  <span
                    style={{
                      width: "fit-content",
                      padding: "0.35rem 0.7rem",
                      borderRadius: "999px",
                      backgroundColor: `${actionColors[log.action] ?? "#64748b"}18`,
                      color: actionColors[log.action] ?? "#64748b",
                      fontWeight: 700,
                      fontSize: "0.8rem",
                    }}
                  >
                    {log.action}
                  </span>
                  <div>
                    <p style={{ fontWeight: 600 }}>{log.performedByName}</p>
                    <p
                      style={{ fontSize: "0.8rem", color: "var(--secondary)" }}
                    >
                      {log.performedBy || "System"}
                    </p>
                  </div>
                  <span style={{ fontSize: "0.85rem" }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--secondary)" }}
                  >
                    {log.ipAddress || "No IP captured"}
                  </span>
                </button>
              ))}
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

        <aside
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "1.25rem",
            height: "100%",
            maxHeight: "620px",
            display: "grid",
            gridTemplateRows: "1fr",
            gap: "1rem",
          }}
        >
          {selectedLog ? (
            <div
              style={{
                display: "grid",
                gap: "1rem",
                overflow: "auto",
                minHeight: 0,
              }}
            >
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

              <div style={{ display: "grid", gap: "0.75rem" }}>
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

              <div style={{ display: "grid", gap: "1rem" }}>
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
                      maxHeight: "240px",
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
                      maxHeight: "240px",
                      overflow: "auto",
                    }}
                  >
                    {prettyPrint(selectedLog.newValues)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                color: "var(--secondary)",
                overflow: "auto",
                minHeight: 0,
              }}
            >
              Select an audit record to inspect its before and after values.
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};
