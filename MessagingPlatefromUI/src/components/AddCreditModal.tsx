import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { z } from "zod";
import type { AdminClientDetail } from "../services/adminService";

const addCreditsSchema = z.object({
  clientId: z.string().min(1, "Select a client."),
  amount: z
    .number({ error: "Enter a credit amount." })
    .int("Credits must be a whole number.")
    .positive("Credits must be greater than zero."),
});

interface AddCreditModalProps {
  isOpen: boolean;
  clients: AdminClientDetail[];
  initialClientId?: string | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { clientId: string; amount: number }) => void;
}

export const AddCreditModal: React.FC<AddCreditModalProps> = ({
  isOpen,
  clients,
  initialClientId,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const [clientId, setClientId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setClientId(initialClientId || "");
    setAmount("");
    setError(null);
  }, [clients, initialClientId, isOpen]);

  if (!isOpen) {
    return null;
  }

  const selectedClient = clients.find((client) => client.id === clientId);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    const result = addCreditsSchema.safeParse({
      clientId,
      amount: parsedAmount,
    });

    if (!result.success) {
      setError(
        result.error.issues[0]?.message || "Enter a valid credit amount.",
      );
      return;
    }

    setError(null);
    onSubmit(result.data);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.52)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.25rem",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          backgroundColor: "var(--card)",
          borderRadius: "1rem",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.1rem 1.25rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Add Credits</h3>
            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--secondary)",
                marginTop: "0.2rem",
              }}
            >
              Top up a client balance with an auditable credit transaction.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: "var(--secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "999px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "1.25rem" }}>
          <div style={{ display: "grid", gap: "1rem" }}>
            <label style={{ display: "grid", gap: "0.45rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Client
              </span>
              <select
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="form-input"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </label>

            <div
              style={{
                padding: "0.9rem 1rem",
                borderRadius: "0.85rem",
                border: "1px solid var(--border)",
                backgroundColor: "var(--background)",
              }}
            >
              <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>
                Current balance
              </p>
              <p
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  marginTop: "0.25rem",
                }}
              >
                {selectedClient?.availableCredits ?? 0}
              </p>
            </div>

            <label style={{ display: "grid", gap: "0.45rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                Credits to add
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="form-input"
                placeholder="Enter credit amount"
              />
            </label>

            {error ? (
              <p style={{ fontSize: "0.8rem", color: "#dc2626" }}>{error}</p>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "1.25rem",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
                padding: "0.7rem 1rem",
                borderRadius: "0.8rem",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                border: "none",
                backgroundColor: "var(--primary)",
                color: "white",
                padding: "0.7rem 1rem",
                borderRadius: "0.8rem",
                fontWeight: 700,
                minWidth: 120,
                opacity: isSubmitting ? 0.8 : 1,
              }}
            >
              {isSubmitting ? "Adding..." : "Add Credits"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
