import React, { useState } from "react";
import { Download, Search } from "lucide-react";
import { Loader } from "../components/Loader";
import { useTransactions } from "../hooks/useSubscriptions";

const paymentStatusStyle = (status: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    Paid: { bg: "rgba(34,197,94,0.12)", color: "#15803d" },
    Pending: { bg: "rgba(245,158,11,0.12)", color: "#b45309" },
    Failed: { bg: "rgba(239,68,68,0.12)", color: "#dc2626" },
  };
  return map[status] ?? { bg: "rgba(107,114,128,0.1)", color: "#6b7280" };
};

export const AdminBillingTransactionsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const { data: transactions = [], isLoading } = useTransactions(
    undefined,
    undefined,
    page,
    PAGE_SIZE,
  );

  const filtered = search
    ? transactions.filter(
        (t) =>
          t.clientName.toLowerCase().includes(search.toLowerCase()) ||
          t.planName.toLowerCase().includes(search.toLowerCase()) ||
          (t.transactionReference ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : transactions;

  const totalRevenue = filtered
    .filter((t) => t.paymentStatus === "Paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const exportCsv = () => {
    const headers = [
      "Client",
      "Plan",
      "Amount",
      "Status",
      "Method",
      "Reference",
      "Paid At",
      "Created At",
    ];
    const rows = filtered.map((t) => [
      t.clientName,
      t.planName,
      t.amount,
      t.paymentStatus,
      t.paymentMethod,
      t.transactionReference ?? "",
      t.paidAt ? new Date(t.paidAt).toLocaleString() : "",
      new Date(t.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.25rem" }}>
            Billing Transactions
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
            Payment history for all subscription events
          </p>
        </div>
        <button className="btn btn-secondary" onClick={exportCsv}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        <SummaryCard
          label="Total Revenue (Paid)"
          value={`₹${totalRevenue.toLocaleString()}`}
          tone="rgba(34,197,94,0.1)"
        />
        <SummaryCard
          label="Transactions"
          value={String(filtered.length)}
          tone="rgba(59,130,246,0.1)"
        />
        <SummaryCard
          label="Paid"
          value={String(
            filtered.filter((t) => t.paymentStatus === "Paid").length,
          )}
          tone="rgba(34,197,94,0.1)"
        />
        <SummaryCard
          label="Pending / Failed"
          value={String(
            filtered.filter((t) => t.paymentStatus !== "Paid").length,
          )}
          tone="rgba(239,68,68,0.1)"
        />
      </div>

      {/* Search */}
      <div className="stat-card" style={{ display: "flex", gap: "0.5rem" }}>
        <Search size={16} style={{ color: "var(--secondary)", marginTop: 2 }} />
        <input
          className="form-input"
          style={{ flex: 1 }}
          placeholder="Search by client, plan or reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <Loader label="Loading transactions…" />
      ) : filtered.length === 0 ? (
        <div
          className="stat-card"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          <p style={{ color: "var(--secondary)" }}>No transactions found.</p>
        </div>
      ) : (
        <div className="stat-card" style={{ overflowX: "auto", padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(0,0,0,0.03)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {[
                  "Client",
                  "Plan",
                  "Amount",
                  "Status",
                  "Method",
                  "Reference",
                  "Paid At",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "left",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--secondary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const st = paymentStatusStyle(t.paymentStatus);
                return (
                  <tr
                    key={t.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                      {t.clientName}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>{t.planName}</td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontWeight: 700,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      ₹{t.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "0.2rem 0.6rem",
                          borderRadius: 999,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        {t.paymentStatus}
                      </span>
                    </td>
                    <td
                      style={{ padding: "0.75rem 1rem", fontSize: "0.82rem" }}
                    >
                      {t.paymentMethod}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "0.78rem",
                        color: "var(--secondary)",
                      }}
                    >
                      {t.transactionReference ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        fontSize: "0.78rem",
                        color: "var(--secondary)",
                      }}
                    >
                      {t.paidAt ? new Date(t.paidAt).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--secondary)",
                alignSelf: "center",
              }}
            >
              Page {page}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={transactions.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{
  label: string;
  value: string;
  tone: string;
}> = ({ label, value, tone }) => (
  <div
    className="stat-card"
    style={{ background: tone, borderColor: "transparent" }}
  >
    <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>{label}</p>
    <p style={{ fontWeight: 700, fontSize: "1.4rem", marginTop: "0.25rem" }}>
      {value}
    </p>
  </div>
);
