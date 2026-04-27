import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Coins } from "lucide-react";
import { Loader } from "./Loader";
import { useClientCredits } from "../hooks/useCredits";

interface CreditCardProps {
  clientId?: string | null;
  isAdminView?: boolean;
  title?: string;
  emptyMessage?: string;
  actionPath?: string;
}

export const CreditCard: React.FC<CreditCardProps> = ({
  clientId,
  isAdminView,
  title = "Available Credits",
  emptyMessage = "Select a client to review the available credit balance.",
  actionPath = "/credits",
}) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useClientCredits(clientId, isAdminView);
  const availableCredits = data?.availableCredits ?? 0;
  const isLowBalance = availableCredits > 0 && availableCredits < 100;

  return (
    <div className="stat-card" style={{ height: "fit-content" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#b45309",
            }}
          >
            Credits
          </p>
          <h3
            style={{ fontSize: "1.2rem", fontWeight: 800, marginTop: "0.4rem" }}
          >
            {title}
          </h3>
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "0.85rem",
            backgroundColor: "rgba(245, 158, 11, 0.14)",
            color: "#b45309",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Coins size={20} />
        </div>
      </div>

      {!clientId ? (
        <p
          style={{
            marginTop: "1rem",
            color: "var(--secondary)",
            fontSize: "0.875rem",
          }}
        >
          {emptyMessage}
        </p>
      ) : isLoading ? (
        <Loader label="Loading credits..." />
      ) : error ? (
        <p
          style={{ marginTop: "1rem", color: "#dc2626", fontSize: "0.875rem" }}
        >
          Unable to load credits right now.
        </p>
      ) : (
        <>
          <div style={{ marginTop: "1.2rem" }}>
            <p style={{ fontSize: "2.1rem", fontWeight: 800 }}>
              {availableCredits}
            </p>
            <p
              style={{
                color: "var(--secondary)",
                fontSize: "0.85rem",
                marginTop: "0.35rem",
              }}
            >
              One message delivery consumes one credit.
            </p>
          </div>

          {isLowBalance ? (
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
                padding: "0.85rem 0.95rem",
                borderRadius: "0.9rem",
                backgroundColor: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.24)",
              }}
            >
              <AlertTriangle
                size={16}
                color="#b45309"
                style={{ marginTop: 2 }}
              />
              <div>
                <p
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#92400e",
                  }}
                >
                  Low balance warning
                </p>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#92400e",
                    marginTop: "0.2rem",
                  }}
                >
                  Available credits are below the operational threshold of 100.
                </p>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => navigate(actionPath)}
            style={{
              marginTop: "1rem",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              width: "100%",
              padding: "0.8rem 1rem",
              borderRadius: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontWeight: 700,
            }}
          >
            <span>View credit activity</span>
            <ArrowRight size={16} />
          </button>
        </>
      )}
    </div>
  );
};
