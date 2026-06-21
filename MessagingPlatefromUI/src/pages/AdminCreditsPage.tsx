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
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          padding: "0.85rem 1rem",
          borderRadius: "0.8rem",
          background:
            "linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(15, 23, 42, 0.03))",
          border: "1px solid rgba(234, 88, 12, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#c2410c",
              marginBottom: "0.2rem",
            }}
          >
            Access Control
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>
            Admin Credits
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
            marginLeft: "auto",
          }}
        >
          <SummaryCard
            icon={<Coins size={13} color="#b45309" />}
            title="Total Credits"
            value={String(totalCredits)}
            color="#b45309"
          />
          <SummaryCard
            icon={<TriangleAlert size={13} color="#b91c1c" />}
            title="Low Balance Clients"
            value={String(lowCreditClients)}
            color="#b91c1c"
          />
          <SummaryCard
            icon={<Users size={13} color="#1d4ed8" />}
            title="Tracked Clients"
            value={String(clients.length)}
            color="#1d4ed8"
          />
        </div>
      </section>

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
  color: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
  color,
}) => (
  <div
    title={`${title}: ${value}`}
    aria-label={`${title}: ${value}`}
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
        backgroundColor: `${color}18`,
      }}
    >
      {icon}
    </span>
    <span
      style={{
        fontSize: "0.78rem",
        fontWeight: 800,
        minWidth: "1ch",
      }}
    >
      {value}
    </span>
  </div>
);
