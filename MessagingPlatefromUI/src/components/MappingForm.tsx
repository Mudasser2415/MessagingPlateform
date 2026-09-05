import React, { useState } from "react";
import type { ClientOption } from "../services/clientService";
import type { EmployeeOption } from "../services/userService";
import { ClientDropdown } from "./ClientDropdown";
import { EmployeeMultiSelect } from "./EmployeeMultiSelect";

interface MappingFormProps {
  clients: ClientOption[];
  employees: EmployeeOption[];
  isSubmitting: boolean;
  onSubmit: (payload: {
    clientIds: string[];
    userIds: string[];
  }) => Promise<void> | void;
}

export const MappingForm: React.FC<MappingFormProps> = ({
  clients,
  employees,
  isSubmitting,
  onSubmit,
}) => {
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (clientIds.length === 0) {
      setError("Select at least one client before assigning employees.");
      return;
    }

    if (!userId) {
      setError("Select an employee.");
      return;
    }

    setError(null);
    await onSubmit({ clientIds, userIds: [userId] });
    setClientIds([]);
    setUserId("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="stack-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: "1rem 1.25rem",
          alignItems: "start",
        }}
      >
        <EmployeeMultiSelect
          employees={employees}
          selectedId={userId}
          onChange={setUserId}
        />
        <ClientDropdown
          clients={clients}
          value={clientIds}
          onChange={(value) =>
            setClientIds(Array.isArray(value) ? value : [value])
          }
          multiple
          label="Select Clients"
        />
      </div>

      {error && (
        <div
          style={{
            marginTop: "1rem",
            padding: "0.8rem 1rem",
            borderRadius: "0.75rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#991b1b",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      <div className="mapping-form-footer">
        <p style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>
          The selected employee is merged into each chosen client assignment
          list without duplicating existing mappings.
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-inline-auto"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.85rem 1.2rem",
            borderRadius: "999px",
            border: "none",
            backgroundColor: "var(--primary)",
            color: "white",
            fontWeight: 700,
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Assigning..." : "Assign Employee"}
        </button>
      </div>
    </form>
  );
};
