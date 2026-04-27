import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Coins, TriangleAlert, Users } from "lucide-react";
import { AddCreditModal } from "../components/AddCreditModal";
import { CreditTable } from "../components/CreditTable";
import { Loader } from "../components/Loader";
import { useAddCredits } from "../hooks/useCredits";
import { adminClientService } from "../services/adminService";

export const AdminCreditsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeClientId, setActiveClientId] = useState<string | null>(null);

  const {
    data: clients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-credits-clients"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const addCreditsMutation = useAddCredits();

  const filteredClients = clients.filter((client) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return [
      client.name,
      client.email,
      client.mobileNumber,
      client.partnerCompanyName,
    ]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedSearch));
  });

  const totalCredits = clients.reduce(
    (sum, client) => sum + client.availableCredits,
    0,
  );
  const lowCreditClients = clients.filter(
    (client) => client.availableCredits < 100,
  ).length;

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
        }}
      >
        <SummaryCard
          icon={<Coins size={18} color="#b45309" />}
          title="Total Credits"
          value={String(totalCredits)}
          tone="rgba(245, 158, 11, 0.12)"
        />
        <SummaryCard
          icon={<TriangleAlert size={18} color="#b91c1c" />}
          title="Low Balance Clients"
          value={String(lowCreditClients)}
          tone="rgba(239, 68, 68, 0.12)"
        />
        <SummaryCard
          icon={<Users size={18} color="#1d4ed8" />}
          title="Tracked Clients"
          value={String(clients.length)}
          tone="rgba(59, 130, 246, 0.12)"
        />
      </div>

      <div className="stat-card" style={{ display: "grid", gap: "0.8rem" }}>
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Search Clients</h3>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--secondary)",
              marginTop: "0.2rem",
            }}
          >
            Filter by client name, email, mobile number, or partner company.
          </p>
        </div>
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="form-input"
          placeholder="Search clients"
        />
      </div>

      {isLoading ? <Loader label="Loading credit balances..." /> : null}
      {error ? (
        <div className="stat-card" style={{ color: "#dc2626" }}>
          Unable to load clients for credit management.
        </div>
      ) : null}
      {!isLoading && !error ? (
        <CreditTable
          clients={filteredClients}
          onAddCredits={(clientId) => setActiveClientId(clientId)}
        />
      ) : null}

      <AddCreditModal
        isOpen={Boolean(activeClientId)}
        clients={clients}
        initialClientId={activeClientId}
        isSubmitting={addCreditsMutation.isPending}
        onClose={() => setActiveClientId(null)}
        onSubmit={(payload) => {
          addCreditsMutation.mutate(payload, {
            onSuccess: () => setActiveClientId(null),
          });
        }}
      />
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  tone: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
  tone,
}) => (
  <div className="stat-card" style={{ display: "grid", gap: "0.8rem" }}>
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: "0.85rem",
        backgroundColor: tone,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </div>
    <div>
      <p style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>{title}</p>
      <p style={{ fontSize: "1.8rem", fontWeight: 800, marginTop: "0.25rem" }}>
        {value}
      </p>
    </div>
  </div>
);
