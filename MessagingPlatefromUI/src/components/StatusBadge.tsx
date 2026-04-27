import React from "react";
import type { ReportStatus } from "../services/reportService";

interface StatusBadgeProps {
  status: ReportStatus;
}

const statusStyles: Record<
  ReportStatus,
  { background: string; color: string }
> = {
  Delivered: { background: "rgba(16, 185, 129, 0.12)", color: "#166534" },
  Sent: { background: "rgba(59, 130, 246, 0.12)", color: "#1d4ed8" },
  Failed: { background: "rgba(239, 68, 68, 0.12)", color: "#b91c1c" },
  Pending: { background: "rgba(245, 158, 11, 0.16)", color: "#b45309" },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = statusStyles[status] ?? {
    background: "rgba(148, 163, 184, 0.16)",
    color: "#475569",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 86,
        padding: "0.3rem 0.7rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 700,
        backgroundColor: styles.background,
        color: styles.color,
      }}
    >
      {status}
    </span>
  );
};
