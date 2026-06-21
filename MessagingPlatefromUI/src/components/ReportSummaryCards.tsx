import React from "react";
import {
  CheckCircle2,
  Clock3,
  MessageSquare,
  Send,
  TriangleAlert,
} from "lucide-react";
import type { ReportSummary } from "../services/reportService";

interface ReportSummaryCardsProps {
  summary?: ReportSummary;
  isLoading?: boolean;
  singleRow?: boolean;
  embedded?: boolean;
}

const summaryCards = [
  {
    key: "total",
    label: "Total Messages",
    icon: MessageSquare,
    color: "#6366f1",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
    color: "#10b981",
  },
  { key: "failed", label: "Failed", icon: TriangleAlert, color: "#ef4444" },
  { key: "pending", label: "Pending", icon: Clock3, color: "#f59e0b" },
  { key: "successRate", label: "Success Rate", icon: Send, color: "#2563eb" },
] as const;

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  summary,
  isLoading,
  singleRow,
  embedded,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        flexWrap: singleRow ? "nowrap" : "wrap",
        overflowX: singleRow ? "auto" : "visible",
        padding: embedded ? "0" : "0.6rem 0.8rem",
        backgroundColor: embedded ? "transparent" : "rgba(168, 85, 247, 0.05)",
        border: embedded ? "none" : "1px solid rgba(168, 85, 247, 0.15)",
        borderRadius: embedded ? "0" : "0.75rem",
      }}
    >
      {summaryCards.map((card) => {
        const Icon = card.icon;
        const rawValue = summary?.[card.key];
        const value =
          card.key === "successRate"
            ? `${rawValue ?? 0}%`
            : String(rawValue ?? 0);

        return (
          <div
            key={card.key}
            title={`${card.label}: ${value}`}
            aria-label={`${card.label}: ${value}`}
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
            {!isLoading ? (
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  minWidth: "1ch",
                }}
              >
                {value}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
