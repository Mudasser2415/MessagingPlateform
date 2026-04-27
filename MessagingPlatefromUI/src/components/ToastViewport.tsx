import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore } from "../store/toastStore";

const toneMap = {
  success: {
    icon: CheckCircle2,
    border: "rgba(5, 150, 105, 0.25)",
    background: "#ecfdf5",
    color: "#065f46",
  },
  error: {
    icon: AlertCircle,
    border: "rgba(220, 38, 38, 0.25)",
    background: "#fef2f2",
    color: "#991b1b",
  },
  info: {
    icon: Info,
    border: "rgba(37, 99, 235, 0.25)",
    background: "#eff6ff",
    color: "#1d4ed8",
  },
} as const;

export const ToastViewport: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        right: "1.25rem",
        bottom: "1.25rem",
        display: "grid",
        gap: "0.75rem",
        zIndex: 1200,
        maxWidth: "360px",
      }}
    >
      {toasts.map((toast) => {
        const tone = toneMap[toast.tone];
        const Icon = tone.icon;

        return (
          <div
            key={toast.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              padding: "0.9rem 1rem",
              borderRadius: "0.9rem",
              border: `1px solid ${tone.border}`,
              backgroundColor: tone.background,
              color: tone.color,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <Icon size={18} style={{ marginTop: "0.1rem", flexShrink: 0 }} />
            <p style={{ flex: 1, fontSize: "0.9rem", fontWeight: 600 }}>
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              style={{
                border: "none",
                background: "transparent",
                color: tone.color,
                display: "inline-flex",
              }}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
