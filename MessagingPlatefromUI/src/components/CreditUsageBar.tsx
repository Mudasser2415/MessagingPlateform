import React from "react";

interface CreditUsageBarProps {
  used: number;
  total: number;
  height?: number;
}

export const CreditUsageBar: React.FC<CreditUsageBarProps> = ({
  used,
  total,
  height = 8,
}) => {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e";

  return (
    <div style={{ display: "grid", gap: "0.3rem" }}>
      <div
        style={{
          background: "rgba(0,0,0,0.08)",
          borderRadius: 999,
          overflow: "hidden",
          height,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: 999,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.72rem",
          color: "var(--secondary)",
        }}
      >
        <span>{used.toLocaleString()} used</span>
        <span>{pct}%</span>
        <span>{total.toLocaleString()} total</span>
      </div>
    </div>
  );
};
