import React from "react";
import type { QuotationStatus } from "../services/quotationService";

const config: Record<
  QuotationStatus,
  { label: string; bg: string; color: string }
> = {
  Draft: {
    label: "Draft",
    bg: "rgba(107,114,128,0.12)",
    color: "#374151",
  },
  Sent: {
    label: "Sent",
    bg: "rgba(59,130,246,0.12)",
    color: "#1d4ed8",
  },
  Approved: {
    label: "Approved",
    bg: "rgba(34,197,94,0.12)",
    color: "#15803d",
  },
  Rejected: {
    label: "Rejected",
    bg: "rgba(239,68,68,0.12)",
    color: "#dc2626",
  },
  Expired: {
    label: "Expired",
    bg: "rgba(249,115,22,0.12)",
    color: "#c2410c",
  },
};

interface Props {
  status: QuotationStatus;
}

export const QuotationStatusBadge: React.FC<Props> = ({ status }) => {
  const c = config[status] ?? {
    label: status,
    bg: "rgba(107,114,128,0.1)",
    color: "#6b7280",
  };
  return (
    <span
      style={{
        fontSize: "0.72rem",
        fontWeight: 700,
        padding: "0.22rem 0.65rem",
        borderRadius: 999,
        background: c.bg,
        color: c.color,
        lineHeight: 1.25,
        textAlign: "center",
        overflowWrap: "anywhere",
      }}
    >
      {c.label}
    </span>
  );
};
