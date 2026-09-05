import React, { useEffect, useMemo, useState } from "react";
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
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, businessTypeFilter, partnerFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / pageSize));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedClients = useMemo(
    () =>
      filteredClients.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [currentPage, filteredClients, pageSize],
  );

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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flexWrap: "wrap",
              }}
            >
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
                overflowWrap: "anywhere",
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
                overflowWrap: "anywhere",
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
        <>
          <CreditTable
            clients={paginatedClients}
            onViewHistory={(clientId) =>
              navigate(`/admin/credit-transactions?clientId=${clientId}`)
            }
            onAddCredits={(clientId) => {
              setActiveClientId(clientId);
              setIsAddCreditsOpen(true);
            }}
          />
          {filteredClients.length > 0 && (
            <div
              style={{
                padding: "1rem 1.5rem 1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderTop: "none",
                borderRadius: "0 0 1rem 1rem",
                boxShadow: "var(--shadow)",
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * pageSize + 1,
                  filteredClients.length,
                )}{" "}
                to{" "}
                {Math.min(currentPage * pageSize, filteredClients.length)} of{" "}
                {filteredClients.length} clients
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <select
                  className="form-input"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    marginBottom: 0,
                    width: "auto",
                    minWidth: "110px",
                  }}
                  aria-label="Rows per page"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{
                      width: "auto",
                      minWidth: "42px",
                      padding: "0.55rem 0.8rem",
                    }}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{
                      width: "auto",
                      minWidth: "42px",
                      padding: "0.55rem 0.8rem",
                    }}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
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
