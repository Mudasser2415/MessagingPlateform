import React, { useEffect, useMemo, useState } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  AlertTriangle,
  Link2,
  ShieldCheck,
  UsersRound,
  Search,
  Plus,
  Users,
  X,
} from "lucide-react";
import { MappingForm } from "../components/MappingForm";
import { MappingTable } from "../components/MappingTable";
import { Loader } from "../components/Loader";
import { clientService } from "../services/clientService";
import { mappingService } from "../services/mappingService";
import { userService } from "../services/userService";
import { adminPartnerService } from "../services/adminService";
import { useToastStore } from "../store/toastStore";

type PendingRemoval = {
  clientId: string;
  userId: string;
  clientName: string;
  employeeName: string;
};

const businessTypes = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Education",
  "Logistics",
  "Hospitality",
  "Manufacturing",
  "Other",
];

export const ClientEmployeeMapping: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(
    null,
  );
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Filters State
  const [searchInput, setSearchInput] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

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

  const { data: partners = [] } = useQuery({
    queryKey: ["mapping-partners-dropdown"],
    queryFn: () => adminPartnerService.getAllPartners(),
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
      clients.map((client, index) => {
        const mapping = mappingQueries[index]?.data || {
          clientId: client.id,
          clientName: client.name,
          employees: [],
        };
        return {
          ...mapping,
          businessType: client.businessType,
          partnerId: client.partnerId,
          partnerCompanyName: client.partnerCompanyName,
          location: client.location,
          mobileNumber: client.mobileNumber,
        };
      }),
    [clients, mappingQueries],
  );

  const filteredMappingRows = useMemo(() => {
    return mappingRows.filter((row) => {
      // 1. Business Type Filter
      if (businessTypeFilter && row.businessType !== businessTypeFilter) {
        return false;
      }

      // 2. Partner Filter
      if (partnerFilter !== "all" && row.partnerId !== partnerFilter) {
        return false;
      }

      // 3. Search Input Filter
      if (searchInput.trim()) {
        const query = searchInput.toLowerCase().trim();
        const clientNameMatch = row.clientName.toLowerCase().includes(query);
        const locationMatch =
          row.location?.toLowerCase().includes(query) ?? false;
        const mobileMatch = row.mobileNumber?.includes(query) ?? false;
        const partnerMatch =
          row.partnerCompanyName?.toLowerCase().includes(query) ?? false;
        const employeeMatch = row.employees.some((emp) =>
          emp.name.toLowerCase().includes(query),
        );

        return (
          clientNameMatch ||
          locationMatch ||
          mobileMatch ||
          partnerMatch ||
          employeeMatch
        );
      }

      return true;
    });
  }, [mappingRows, businessTypeFilter, partnerFilter, searchInput]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMappingRows.length / pageSize),
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchInput, businessTypeFilter, partnerFilter, pageSize]);

  const paginatedMappingRows = useMemo(
    () =>
      filteredMappingRows.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [currentPage, filteredMappingRows, pageSize],
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
    <div style={{ display: "grid", gap: "1rem" }}>
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
                Mapping Directory
              </h2>
              <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                Search mappings, narrow by partner or business type, then manage
                employee assignments.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flexWrap: "nowrap",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setShowAssignModal(true);
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
                  backgroundColor: "#00777a",
                  color: "white",
                  border: "none",
                }}
              >
                <Plus size={14} />
                Assign Employee
              </button>
              <div
                style={{
                  flex: "0 0 auto",
                  whiteSpace: "nowrap",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {filteredMappingRows.length} showing
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
                placeholder="Search by client, employee, location, or partner"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
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
                <option key={partner.partnerId} value={partner.partnerId}>
                  {partner.companyName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <MappingTable
          rows={paginatedMappingRows}
          isLoading={mappingsLoading}
          onRemove={setPendingRemoval}
        />
        {!mappingsLoading && filteredMappingRows.length > 0 && (
          <div
            style={{
              padding: "1rem 1.5rem 1.25rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "var(--secondary)" }}>
              Showing{" "}
              {Math.min(
                (currentPage - 1) * pageSize + 1,
                filteredMappingRows.length,
              )}{" "}
              to {Math.min(currentPage * pageSize, filteredMappingRows.length)}{" "}
              of {filteredMappingRows.length} mappings
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
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span
                  style={{ fontSize: "0.85rem", color: "var(--secondary)" }}
                >
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

      {showAssignModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            style={{
              maxWidth: "680px",
            }}
          >
            <div className="modal-header">
              <h2>Assign Employee</h2>
              <button
                className="modal-close"
                onClick={() => setShowAssignModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
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
                  Unable to load mapping dependencies. Check the client and
                  employee APIs.
                </div>
              ) : (
                <MappingForm
                  clients={clients}
                  employees={employees}
                  isSubmitting={assignMutation.isPending}
                  onSubmit={async (payload) => {
                    await assignMutation.mutateAsync(payload);
                    setShowAssignModal(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
