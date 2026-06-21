import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AddCreditModal } from "../components/AddCreditModal";
import { CreditTable } from "../components/CreditTable";
import { Loader } from "../components/Loader";
import { useAddCredits } from "../hooks/useCredits";
import { adminClientService } from "../services/adminService";

export const AdminCreditsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [isAddCreditsOpen, setIsAddCreditsOpen] = useState(false);
  const navigate = useNavigate();

  const {
    data: clients = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-credits-clients"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const addCreditsMutation = useAddCredits();

  const businessTypes = useMemo(
    () =>
      Array.from(
        new Set(clients.map((client) => client.businessType).filter(Boolean)),
      ).sort(),
    [clients],
  );

  const partners = useMemo(
    () =>
      Array.from(
        new Set(
          clients
            .map((client) => client.partnerCompanyName?.trim() || "Direct")
            .filter(Boolean),
        ),
      ).sort(),
    [clients],
  );

  const filteredClients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          client.name,
          client.email,
          client.mobileNumber,
          client.partnerCompanyName || "Direct",
          client.location,
          client.businessType,
        ]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedSearch));

      const matchesBusinessType =
        !businessTypeFilter || client.businessType === businessTypeFilter;

      const clientPartner = client.partnerCompanyName?.trim() || "Direct";
      const matchesPartner =
        partnerFilter === "all" || clientPartner === partnerFilter;

      return matchesSearch && matchesBusinessType && matchesPartner;
    });
  }, [businessTypeFilter, clients, partnerFilter, searchTerm]);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "1.25rem 1.5rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
              Client Credit Directory
            </h2>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--secondary)",
                marginTop: "0.35rem",
              }}
            >
              Search clients, narrow by business or partner, then top up credit
              balances.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setActiveClientId(null);
                setIsAddCreditsOpen(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                width: "auto",
                flex: "0 0 auto",
                whiteSpace: "nowrap",
                padding: "0.45rem 0.8rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 700,
              }}
            >
              <PlusCircle size={14} />
              Add Credits
            </button>
            <div
              style={{
                whiteSpace: "nowrap",
                padding: "0.45rem 0.8rem",
                borderRadius: "999px",
                backgroundColor: "rgba(99, 102, 241, 0.08)",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {filteredClients.length} showing
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.85rem",
          }}
        >
          <div style={{ position: "relative", minWidth: 0 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.9rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--secondary)",
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search by client, location, phone, or partner"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{ marginBottom: 0, paddingLeft: "2.5rem" }}
            />
          </div>

          <select
            className="form-input"
            value={businessTypeFilter}
            onChange={(event) => setBusinessTypeFilter(event.target.value)}
            style={{ marginBottom: 0 }}
          >
            <option value="">All business types</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            className="form-input"
            value={partnerFilter}
            onChange={(event) => setPartnerFilter(event.target.value)}
            style={{ marginBottom: 0 }}
          >
            <option value="all">All partners</option>
            {partners.map((partner) => (
              <option key={partner} value={partner}>
                {partner}
              </option>
            ))}
          </select>
        </div>

        {(searchTerm || businessTypeFilter || partnerFilter !== "all") && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearchTerm("");
                setBusinessTypeFilter("");
                setPartnerFilter("all");
              }}
              style={{ width: "auto" }}
            >
              <X size={14} /> Clear filters
            </button>
          </div>
        )}
      </section>

      {isLoading ? <Loader label="Loading credit balances..." /> : null}
      {error ? (
        <div className="stat-card" style={{ color: "#dc2626" }}>
          Unable to load clients for credit management.
        </div>
      ) : null}
      {!isLoading && !error ? (
        <CreditTable
          clients={filteredClients}
          onViewHistory={(clientId) =>
            navigate(`/admin/credit-transactions?clientId=${clientId}`)
          }
          onAddCredits={(clientId) => {
            setActiveClientId(clientId);
            setIsAddCreditsOpen(true);
          }}
        />
      ) : null}

      <AddCreditModal
        isOpen={isAddCreditsOpen}
        clients={clients}
        initialClientId={activeClientId}
        isSubmitting={addCreditsMutation.isPending}
        onClose={() => {
          setIsAddCreditsOpen(false);
          setActiveClientId(null);
        }}
        onSubmit={(payload) => {
          addCreditsMutation.mutate(payload, {
            onSuccess: () => {
              setIsAddCreditsOpen(false);
              setActiveClientId(null);
            },
          });
        }}
      />
    </div>
  );
};
