import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { mappingService } from "../services/mappingService";
import { useAuthStore } from "../store/authStore";

export const AssignedClientSelector: React.FC = () => {
  const { user, selectedClientId, setSelectedClientId } = useAuthStore();

  const { data: assignedClients = [] } = useQuery({
    queryKey: ["employee-assigned-clients", user?.id],
    queryFn: () => mappingService.getAssignedClientsForEmployee(user?.id || ""),
    enabled: user?.role === "Employee" && Boolean(user?.id),
  });

  useEffect(() => {
    if (!selectedClientId && assignedClients.length > 0) {
      setSelectedClientId(assignedClients[0].clientId);
    }
  }, [assignedClients, selectedClientId, setSelectedClientId]);

  if (user?.role !== "Employee") {
    return null;
  }

  if (assignedClients.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.65rem 0.9rem",
          borderRadius: "999px",
          border: "1px solid rgba(234, 88, 12, 0.2)",
          backgroundColor: "rgba(234, 88, 12, 0.08)",
          color: "#c2410c",
          fontWeight: 700,
          fontSize: "0.82rem",
        }}
      >
        <Building2 size={14} />
        No assigned clients
      </div>
    );
  }

  return (
    <div
      style={{
        minWidth: "220px",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontSize: "0.72rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--secondary)",
          marginBottom: 0,
          whiteSpace: "nowrap",
        }}
      >
        Active Client
      </label>
      <select
        className="form-input"
        value={selectedClientId || ""}
        onChange={(event) => setSelectedClientId(event.target.value)}
        style={{ marginBottom: 0, minWidth: "220px", flex: 1 }}
      >
        {assignedClients.map((client) => (
          <option key={client.clientId} value={client.clientId}>
            {client.clientName}
          </option>
        ))}
      </select>
    </div>
  );
};
