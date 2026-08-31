import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Phone, Plus, Search, Upload, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { CSVUploadModal } from "../components/CSVUploadModal";
import { Loader } from "../components/Loader";
import {
  adminClientService,
  type AdminClientDetail,
} from "../services/adminService";
import {
  groupService,
  type GroupDto,
  type GroupMemberDto,
} from "../services/groupService";
import { useToastStore } from "../store/toastStore";
import "./AdminGroupsPage.css";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const AdminGroupsPage: React.FC = () => {
  const qc = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [createGroupName, setCreateGroupName] = useState("");
  const [createClientId, setCreateClientId] = useState("");
  const [createGroupError, setCreateGroupError] = useState("");

  const { data: groups = [], isLoading: groupsLoading } = useQuery<GroupDto[]>({
    queryKey: ["admin-groups"],
    queryFn: groupService.getGroups,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery<
    AdminClientDetail[]
  >({
    queryKey: ["admin-group-clients"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const clientsById = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients],
  );

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return groups.filter((group) => {
      const client = clientsById.get(group.clientId);
      const matchesClient =
        clientFilter === "all" || group.clientId === clientFilter;
      const matchesSearch =
        !normalizedSearch ||
        group.groupName.toLowerCase().includes(normalizedSearch) ||
        client?.name.toLowerCase().includes(normalizedSearch) ||
        client?.partnerCompanyName?.toLowerCase().includes(normalizedSearch);

      return matchesClient && matchesSearch;
    });
  }, [clientFilter, clientsById, groups, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, clientFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    if (filteredGroups.length === 0) {
      setSelectedGroupId(null);
      return;
    }

    setSelectedGroupId((current) =>
      filteredGroups.some((group) => group.groupId === current)
        ? current
        : filteredGroups[0].groupId,
    );
  }, [filteredGroups]);

  const selectedGroup =
    filteredGroups.find((group) => group.groupId === selectedGroupId) ?? null;

  const { data: selectedMembers = [], isLoading: membersLoading } = useQuery<
    GroupMemberDto[]
  >({
    queryKey: ["admin-group-members", selectedGroupId],
    queryFn: () => groupService.getGroupMembers(selectedGroupId as string),
    enabled: Boolean(selectedGroupId),
  });

  const selectedClient = selectedGroup
    ? (clientsById.get(selectedGroup.clientId) ?? null)
    : null;

  const createMutation = useMutation({
    mutationFn: async ({
      name,
      clientId,
    }: {
      name: string;
      clientId: string;
    }) => groupService.createGroupWithBulkPhones(name, clientId, []),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-groups"] });
      qc.invalidateQueries({ queryKey: ["groups"] });
      setShowCreateGroupModal(false);
      setCreateGroupName("");
      setCreateGroupError("");
      addToast("Group created successfully.", "success");
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create group. Please try again.";
      setCreateGroupError(message);
    },
  });

  const csvUploadMutation = useMutation({
    mutationFn: async (phoneNumbers: string[]) => {
      if (!selectedGroupId) {
        throw new Error("Select a group before uploading members.");
      }

      await groupService.updateGroupMembers(selectedGroupId, phoneNumbers);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-groups"] });
      await qc.invalidateQueries({ queryKey: ["groups"] });
      if (selectedGroupId) {
        await qc.invalidateQueries({
          queryKey: ["admin-group-members", selectedGroupId],
        });
      }
      setShowCSVModal(false);
      addToast("Group members updated successfully.", "success");
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to upload members. Please try again.";
      addToast(message, "error");
    },
  });

  const openCreateGroupModal = () => {
    const defaultClientId =
      clientFilter !== "all" ? clientFilter : (clients[0]?.id ?? "");
    setCreateClientId(defaultClientId);
    setCreateGroupName("");
    setCreateGroupError("");
    setShowCreateGroupModal(true);
  };

  const handleCreateGroup = async () => {
    if (!createGroupName.trim()) {
      setCreateGroupError("Group name is required.");
      return;
    }

    if (!createClientId) {
      setCreateGroupError("Please choose a client.");
      return;
    }

    setCreateGroupError("");
    await createMutation.mutateAsync({
      name: createGroupName.trim(),
      clientId: createClientId,
    });
  };

  // const coveredClientCount = new Set(groups.map((group) => group.clientId))
  //   .size;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          display: "block",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
            display: "grid",
            gridTemplateRows: "auto 1fr",
            maxHeight: "620px",
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
                  Group Directory
                </h2>
                <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                  Search groups, narrow by client, then inspect membership and
                  client details.
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
                {groups.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCSVModal(true)}
                    disabled={!selectedGroupId}
                    title={
                      selectedGroupId
                        ? "Bulk upload members to selected group"
                        : "Select a group to enable bulk upload"
                    }
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
                    <Upload size={14} />
                    Bulk Upload
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={openCreateGroupModal}
                  disabled={clientsLoading || clients.length === 0}
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
                  <Plus size={14} />
                  Create Group
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
                  {filteredGroups.length} showing
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
                  placeholder="Search by group, client, or partner"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{ marginBottom: 0, paddingLeft: "2.5rem" }}
                />
              </div>

              <select
                className="form-input"
                value={clientFilter}
                onChange={(event) => setClientFilter(event.target.value)}
                style={{ marginBottom: 0 }}
                disabled={clientsLoading}
              >
                <option value="all">All clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {groupsLoading ? (
            <div style={{ padding: "2rem 1.5rem", color: "var(--secondary)" }}>
              Loading groups...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div
              style={{
                padding: "2rem 1.5rem",
                color: "var(--secondary)",
                textAlign: "center",
              }}
            >
              No groups matched the current filters.
            </div>
          ) : (
            <div
              className="table-container"
              style={{
                border: "none",
                boxShadow: "none",
                borderRadius: 0,
                overflowY: "auto",
              }}
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Group Name</th>
                    <th>Client</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedGroups.map((group) => {
                    const client = clientsById.get(group.clientId);
                    const isSelected = selectedGroup?.groupId === group.groupId;

                    return (
                      <tr
                        key={group.groupId}
                        onClick={() => setSelectedGroupId(group.groupId)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSelected
                            ? "rgba(99, 102, 241, 0.06)"
                            : undefined,
                        }}
                      >
                        <td style={{ verticalAlign: "middle" }}>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              title="View details"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelectedGroupId(group.groupId);
                                setShowDetailsModal(true);
                              }}
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          <div style={{ fontWeight: 700 }}>
                            {group.groupName}
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--secondary)",
                              marginTop: "0.2rem",
                            }}
                          >
                            ID: {group.groupId}
                          </div>
                        </td>
                        <td style={{ verticalAlign: "middle" }}>
                          <div style={{ fontWeight: 600 }}>
                            {client?.name || "Unknown client"}
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--secondary)",
                              marginTop: "0.2rem",
                            }}
                          >
                            {client?.partnerCompanyName || "No partner linked"}
                          </div>
                        </td>
                        <td
                          style={{
                            verticalAlign: "middle",
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDateTime(group.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="admin-groups-page__table-footer">
                <div className="admin-groups-page__pagination-summary">
                  {filteredGroups.length === 0
                    ? "No groups to display"
                    : `Showing ${Math.min(
                        (currentPage - 1) * pageSize + 1,
                        filteredGroups.length,
                      )} to ${Math.min(
                        currentPage * pageSize,
                        filteredGroups.length,
                      )} of ${filteredGroups.length} groups`}
                </div>

                <div
                  className="admin-groups-page__pagination"
                  aria-label="Pagination"
                >
                  <select
                    className="form-input admin-groups-page__page-select"
                    value={pageSize}
                    onChange={(event) =>
                      setPageSize(Number(event.target.value))
                    }
                    aria-label="Rows per page"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="admin-groups-page__pagination-controls">
                    <select
                      className="form-input admin-groups-page__page-select"
                      value={currentPage}
                      onChange={(event) =>
                        setCurrentPage(Number(event.target.value))
                      }
                      aria-label="Select page"
                    >
                      {Array.from({ length: totalPages }, (_, index) => {
                        const page = index + 1;
                        return (
                          <option key={page} value={page}>
                            {page}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm admin-groups-page__pagination-button"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <span className="admin-groups-page__pagination-summary">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm admin-groups-page__pagination-button"
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
            </div>
          )}
        </div>
      </section>

      {showDetailsModal && selectedGroup && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "96vw",
              maxWidth: "800px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div className="modal-header">
              <h2>Group Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "1rem",
                overflowY: "auto",
                paddingRight: "0.25rem",
              }}
            >
              {/* Header / Basic Info */}
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "0.9rem",
                  background:
                    "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.04))",
                  border: "1px solid rgba(37, 99, 235, 0.12)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--primary)",
                    }}
                  >
                    Selected Group
                  </p>
                  <h3
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 800,
                      marginTop: "0.2rem",
                      color: "var(--foreground)",
                    }}
                  >
                    {selectedGroup.groupName}
                  </h3>
                </div>
                <div
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: "999px",
                    backgroundColor: "rgba(37, 99, 235, 0.08)",
                    color: "#2563eb",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Created {formatDateTime(selectedGroup.createdAt)}
                </div>
              </div>

              {/* Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "0.85rem",
                }}
              >
                {[
                  { label: "Group ID", value: selectedGroup.groupId },
                  {
                    label: "Client Owner",
                    value: selectedClient?.name || "Unknown client",
                  },
                  {
                    label: "Partner Company",
                    value:
                      selectedClient?.partnerCompanyName || "No partner linked",
                  },
                  {
                    label: "Client Location",
                    value: selectedClient?.location || "Not available",
                  },
                ].map((item) => {
                  return (
                    <div
                      key={item.label}
                      style={{
                        padding: "0.75rem 0.95rem",
                        borderRadius: "0.85rem",
                        border: "1px solid var(--border)",
                        backgroundColor: "var(--background)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--secondary)",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          wordBreak: "break-word",
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Members list */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                    borderBottom: "1px solid var(--border)",
                    paddingBottom: "0.5rem",
                  }}
                >
                  <h4 style={{ fontSize: "0.9rem", fontWeight: 800 }}>
                    Group Members
                  </h4>
                  <span
                    style={{
                      padding: "0.25rem 0.55rem",
                      borderRadius: "999px",
                      backgroundColor: "rgba(99, 102, 241, 0.08)",
                      color: "var(--primary)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {membersLoading
                      ? "Loading..."
                      : `${selectedMembers.length} total`}
                  </span>
                </div>

                {membersLoading ? (
                  <Loader label="Loading members..." />
                ) : selectedMembers.length === 0 ? (
                  <p
                    style={{
                      color: "var(--secondary)",
                      fontSize: "0.85rem",
                      textAlign: "center",
                      padding: "1.5rem",
                    }}
                  >
                    This group does not have any members yet.
                  </p>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gap: "0.5rem",
                      maxHeight: "240px",
                      overflowY: "auto",
                      paddingRight: "0.25rem",
                    }}
                  >
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "0.85rem",
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--background)",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "999px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(37, 99, 235, 0.1)",
                            color: "#2563eb",
                          }}
                        >
                          <Phone size={13} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>
                            {member.phoneNumber}
                          </p>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--secondary)",
                            }}
                          >
                            Member ID: {member.id}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCSVModal && selectedGroup && (
        <CSVUploadModal
          title="Upload Phone Numbers to Group"
          description={`Upload a CSV file to update members for \"${selectedGroup.groupName}\". The new numbers will replace the existing member list.`}
          onClose={() => setShowCSVModal(false)}
          onUpload={(phoneNumbers) =>
            csvUploadMutation.mutateAsync(phoneNumbers)
          }
          isLoading={csvUploadMutation.isPending}
        />
      )}

      {showCreateGroupModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!createMutation.isPending) {
              setShowCreateGroupModal(false);
            }
          }}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "96vw",
              maxWidth: "520px",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div className="modal-header">
              <h2>Create Group</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateGroupModal(false)}
                disabled={createMutation.isPending}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gap: "0.9rem" }}>
              <div>
                <label className="form-label">Group Name</label>
                <input
                  className="form-input"
                  value={createGroupName}
                  onChange={(event) => setCreateGroupName(event.target.value)}
                  placeholder="Enter group name"
                  autoFocus
                />
              </div>

              <div>
                <label className="form-label">Client</label>
                <select
                  className="form-input"
                  value={createClientId}
                  onChange={(event) => setCreateClientId(event.target.value)}
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {createGroupError && (
                <p style={{ color: "#dc2626", fontSize: "0.82rem" }}>
                  {createGroupError}
                </p>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.65rem",
                borderTop: "1px solid var(--border)",
                paddingTop: "0.95rem",
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowCreateGroupModal(false)}
                disabled={createMutation.isPending}
                style={{ width: "auto", paddingInline: "1.05rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateGroup}
                disabled={createMutation.isPending}
                style={{ width: "auto", paddingInline: "1.05rem" }}
              >
                {createMutation.isPending ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
