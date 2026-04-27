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
}) => {
  return (
    <div className="report-summary-grid">
      {summaryCards.map((card) => {
        const Icon = card.icon;
        const rawValue = summary?.[card.key];
        const value =
          card.key === "successRate"
            ? `${rawValue ?? 0}%`
            : String(rawValue ?? 0);

        return (
          <div key={card.key} className="report-metric-card">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "0.9rem",
                backgroundColor: `${card.color}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: card.color,
              }}
            >
              <Icon size={18} />
            </div>
            <div style={{ marginTop: "0.9rem" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>
                {card.label}
              </p>
              {isLoading ? (
                <div
                  className="report-skeleton-line"
                  style={{ marginTop: "0.5rem", width: "70%", height: 28 }}
                />
              ) : (
                <p
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 800,
                    marginTop: "0.25rem",
                  }}
                >
                  {value}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
