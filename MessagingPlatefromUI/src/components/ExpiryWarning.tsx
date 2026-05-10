import React from "react";
import { AlertTriangle, Clock } from "lucide-react";

interface ExpiryWarningProps {
  daysUntilExpiry: number;
  isInGracePeriod: boolean;
  gracePeriodDays: number;
}

export const ExpiryWarning: React.FC<ExpiryWarningProps> = ({
  daysUntilExpiry,
  isInGracePeriod,
  gracePeriodDays,
}) => {
  if (daysUntilExpiry > 7 && !isInGracePeriod) return null;

  const isUrgent = daysUntilExpiry <= 3 || isInGracePeriod;
  const bg = isUrgent ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)";
  const border = isUrgent ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)";
  const iconColor = isUrgent ? "#dc2626" : "#d97706";

  const message = isInGracePeriod
    ? `In grace period — ${gracePeriodDays} days before hard-disable`
    : daysUntilExpiry <= 0
      ? "Expired"
      : `Expires in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.35rem 0.7rem",
        borderRadius: "0.5rem",
        background: bg,
        border: `1px solid ${border}`,
        fontSize: "0.78rem",
        fontWeight: 600,
        color: iconColor,
        width: "fit-content",
      }}
    >
      {isUrgent ? <AlertTriangle size={14} /> : <Clock size={14} />}
      {message}
    </div>
  );
};
