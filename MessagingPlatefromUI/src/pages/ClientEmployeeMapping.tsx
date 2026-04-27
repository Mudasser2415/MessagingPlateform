import React, { useMemo, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AlertTriangle, Link2, ShieldCheck, UsersRound } from "lucide-react";
import { MappingForm } from "../components/MappingForm";
import { MappingTable } from "../components/MappingTable";
import { Loader } from "../components/Loader";
import { clientService } from "../services/clientService";
import { mappingService } from "../services/mappingService";
import { userService } from "../services/userService";
import { useToastStore } from "../store/toastStore";

type PendingRemoval = {
  clientId: string;
  userId: string;
  clientName: string;
  employeeName: string;
};

export const ClientEmployeeMapping: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(
    null,
  );

  const {
    data: clients = [],
    isLoading: clientsLoading,
    isError: clientsError,
  } = useQuery({
    queryKey: ["mapping-clients"],
    queryFn: clientService.getClients,
  });

  const {
    data: employees = [],
    isLoading: employeesLoading,
    isError: employeesError,
  } = useQuery({
    queryKey: ["mapping-employees"],
    queryFn: userService.getEmployees,
  });

  const mappingQueries = useQueries({
    queries: clients.map((client) => ({
      queryKey: ["client-employee-mapping", client.id],
      queryFn: () => mappingService.getMappingsByClient(client.id),
      enabled: clients.length > 0,
    })),
  });

  const assignMutation = useMutation({
    mutationFn: (payload: { clientIds: string[]; userIds: string[] }) =>
      mappingService.assignEmployeesToClients(payload),
    onSuccess: (results) => {
      results.forEach((result) => {
        queryClient.setQueryData(
          ["client-employee-mapping", result.clientId],
          result,
        );
      });
      queryClient.invalidateQueries({
        queryKey: ["employee-assigned-clients"],
      });
      addToast(
        "Employees assigned successfully to selected clients.",
        "success",
      );
    },
    onError: (error: any) => {
      addToast(
        error?.response?.data?.message || "Failed to assign employees.",
        "error",
      );
    },
  });

  const removeMutation = useMutation({
    mutationFn: (payload: { clientId: string; userId: string }) =>
      mappingService.removeMapping(payload),
    onSuccess: (_, payload) => {
      queryClient.invalidateQueries({
        queryKey: ["client-employee-mapping", payload.clientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["employee-assigned-clients"],
      });
      addToast("Employee removed from client successfully.", "success");
      setPendingRemoval(null);
    },
    onError: (error: any) => {
      addToast(
        error?.response?.data?.message || "Failed to remove mapping.",
        "error",
      );
    },
  });

  const mappingRows = useMemo(
    () =>
      clients.map(
        (client, index) =>
          mappingQueries[index]?.data || {
            clientId: client.id,
            clientName: client.name,
            employees: [],
          },
      ),
    [clients, mappingQueries],
  );

  const totalMappings = mappingRows.reduce(
    (sum, row) => sum + row.employees.length,
    0,
  );

  const mappedClients = mappingRows.filter(
    (row) => row.employees.length > 0,
  ).length;
  const mappingsLoading = mappingQueries.some((query) => query.isLoading);

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <section
        style={{
          padding: "1.75rem",
          borderRadius: "1rem",
          background:
            "linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(15, 23, 42, 0.03))",
          border: "1px solid rgba(234, 88, 12, 0.18)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <div style={{ gridColumn: "span 2" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#c2410c",
            }}
          >
            Access Control
          </p>
          <h1
            style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.5rem" }}
          >
            Client Employee Mapping
          </h1>
          <p
            style={{
              color: "var(--secondary)",
              marginTop: "0.75rem",
              maxWidth: "64ch",
            }}
          >
            Map employees to multiple clients, review who has access to each
            tenant, and remove individual assignments without leaving the admin
            console.
          </p>
        </div>

        {[
          {
            label: "Clients",
            value: clients.length,
            icon: Link2,
            color: "#2563eb",
          },
          {
            label: "Employees",
            value: employees.length,
            icon: UsersRound,
            color: "#059669",
          },
          {
            label: "Mapped Clients",
            value: mappedClients,
            icon: ShieldCheck,
            color: "#7c3aed",
          },
          {
            label: "Total Assignments",
            value: totalMappings,
            icon: AlertTriangle,
            color: "#ea580c",
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              style={{
                padding: "1rem",
                borderRadius: "0.85rem",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: `${card.color}15`,
                  marginBottom: "0.9rem",
                }}
              >
                <Icon size={18} color={card.color} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--secondary)" }}>
                {card.label}
              </p>
              <p style={{ fontSize: "1.8rem", fontWeight: 800 }}>
                {card.value}
              </p>
            </div>
          );
        })}
      </section>

      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "1.5rem",
          boxShadow: "var(--shadow)",
        }}
      >
        <div style={{ marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Mapping Form</h2>
          <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
            Select one or more clients and assign one employee using searchable
            dropdowns.
          </p>
        </div>

        {clientsLoading || employeesLoading ? (
          <Loader label="Loading clients and employees..." />
        ) : clientsError || employeesError ? (
          <div
            style={{
              padding: "1rem",
              borderRadius: "0.75rem",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              color: "#991b1b",
              fontWeight: 600,
            }}
          >
            Unable to load mapping dependencies. Check the client and employee
            APIs.
          </div>
        ) : (
          <MappingForm
            clients={clients}
            employees={employees}
            isSubmitting={assignMutation.isPending}
            onSubmit={async (payload) => {
              await assignMutation.mutateAsync(payload);
            }}
          />
        )}
      </section>

      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              Mapping Table
            </h2>
            <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
              Review every client and remove individual employee mappings with
              confirmation.
            </p>
          </div>
          <div
            style={{
              padding: "0.45rem 0.8rem",
              borderRadius: "999px",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              color: "var(--primary)",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          >
            {totalMappings} assignments
          </div>
        </div>

        <MappingTable
          rows={mappingRows}
          isLoading={mappingsLoading}
          onRemove={setPendingRemoval}
        />
      </section>

      {pendingRemoval && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              borderRadius: "1rem",
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                Remove Mapping?
              </h3>
              <p style={{ color: "var(--secondary)", marginTop: "0.6rem" }}>
                Remove <strong>{pendingRemoval.employeeName}</strong> from{" "}
                <strong>{pendingRemoval.clientName}</strong>?
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--border)",
              }}
            >
              <button
                type="button"
                onClick={() => setPendingRemoval(null)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  backgroundColor: "transparent",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  removeMutation.mutate({
                    clientId: pendingRemoval.clientId,
                    userId: pendingRemoval.userId,
                  })
                }
                disabled={removeMutation.isPending}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "white",
                  fontWeight: 700,
                  opacity: removeMutation.isPending ? 0.7 : 1,
                }}
              >
                {removeMutation.isPending ? "Removing..." : "Confirm Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
