import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Phone, Search, Users } from "lucide-react";
import {
  adminClientService,
  type AdminClientDetail,
} from "../services/adminService";
import {
  groupService,
  type GroupDto,
  type GroupMemberDto,
} from "../services/groupService";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const AdminGroupsPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

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

  const coveredClientCount = new Set(groups.map((group) => group.clientId))
    .size;

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          padding: "0.85rem 1rem",
          borderRadius: "0.8rem",
          background:
            "linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(15, 23, 42, 0.03))",
          border: "1px solid rgba(59, 130, 246, 0.18)",
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
              color: "#2563eb",
              marginBottom: "0.2rem",
            }}
          >
            Group Directory
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>
            Groups
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
          {[
            {
              icon: Users,
              label: "Total Groups",
              value: groups.length,
              color: "#2563eb",
            },
            {
              icon: Building2,
              label: "Clients Covered",
              value: coveredClientCount,
              color: "#0f766e",
            },
            {
              icon: Search,
              label: "Filtered Results",
              value: filteredGroups.length,
              color: "#7c3aed",
            },
            {
              icon: Phone,
              label: "Selected Members",
              value: selectedGroup ? selectedMembers.length : 0,
              color: "#ea580c",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                title={`${card.label}: ${card.value}`}
                aria-label={`${card.label}: ${card.value}`}
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
                    backgroundColor: `${card.color}18`,
                  }}
                >
                  <Icon size={13} color={card.color} />
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    minWidth: "1ch",
                  }}
                >
                  {card.value}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          padding: "1.5rem",
          display: "grid",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Search</span>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "0.75rem",
                  transform: "translateY(-50%)",
                  color: "var(--secondary)",
                }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: "2.25rem", marginBottom: 0 }}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by group or client"
              />
            </div>
          </label>

          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Client</span>
            <select
              className="form-input"
              value={clientFilter}
              onChange={(event) => setClientFilter(event.target.value)}
              disabled={clientsLoading}
            >
              <option value="all">All clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            overflow: "hidden",
            maxHeight: "620px",
            display: "grid",
            gridTemplateRows: "auto 1fr",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 0.9fr",
              gap: "1rem",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "var(--secondary)",
            }}
          >
            <span>Group</span>
            <span>Client</span>
            <span>Created</span>
          </div>

          {groupsLoading ? (
            <div style={{ padding: "2rem 1.25rem", color: "var(--secondary)" }}>
              Loading groups...
            </div>
          ) : filteredGroups.length === 0 ? (
            <div style={{ padding: "2rem 1.25rem", color: "var(--secondary)" }}>
              No groups matched the current filters.
            </div>
          ) : (
            <div style={{ overflow: "auto" }}>
              {filteredGroups.map((group) => {
                const client = clientsById.get(group.clientId);
                const isSelected = selectedGroup?.groupId === group.groupId;

                return (
                  <button
                    key={group.groupId}
                    type="button"
                    onClick={() => setSelectedGroupId(group.groupId)}
                    style={{
                      width: "100%",
                      border: "none",
                      borderTop: "1px solid var(--border)",
                      backgroundColor: isSelected
                        ? "rgba(37, 99, 235, 0.06)"
                        : "transparent",
                      padding: "0.9rem 1.25rem",
                      textAlign: "left",
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1fr 0.9fr",
                      gap: "1rem",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700 }}>{group.groupName}</p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {group.groupId}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontWeight: 600 }}>
                        {client?.name || "Unknown client"}
                      </p>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {client?.partnerCompanyName || "No partner linked"}
                      </p>
                    </div>
                    <span style={{ fontSize: "0.85rem" }}>
                      {formatDateTime(group.createdAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "1.25rem",
            maxHeight: "620px",
            height: "100%",
            display: "grid",
            gridTemplateRows: "1fr",
          }}
        >
          {selectedGroup ? (
            <div
              style={{
                display: "grid",
                gap: "1rem",
                overflow: "auto",
                minHeight: 0,
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--secondary)",
                    textTransform: "uppercase",
                  }}
                >
                  Selected Group
                </p>
                <h2
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    marginTop: "0.35rem",
                  }}
                >
                  {selectedGroup.groupName}
                </h2>
                <p style={{ marginTop: "0.35rem", color: "var(--secondary)" }}>
                  Created {formatDateTime(selectedGroup.createdAt)}
                </p>
              </div>

              <div style={{ display: "grid", gap: "0.75rem" }}>
                {[
                  ["Group ID", selectedGroup.groupId],
                  ["Client", selectedClient?.name || "Unknown client"],
                  [
                    "Partner",
                    selectedClient?.partnerCompanyName || "No partner linked",
                  ],
                  ["Location", selectedClient?.location || "Not available"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p
                      style={{ fontSize: "0.78rem", color: "var(--secondary)" }}
                    >
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        wordBreak: "break-word",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    marginBottom: "0.75rem",
                  }}
                >
                  <p style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                    Members
                  </p>
                  <span
                    style={{ fontSize: "0.8rem", color: "var(--secondary)" }}
                  >
                    {membersLoading
                      ? "Loading..."
                      : `${selectedMembers.length} total`}
                  </span>
                </div>

                {membersLoading ? (
                  <div style={{ color: "var(--secondary)" }}>
                    Loading group members...
                  </div>
                ) : selectedMembers.length === 0 ? (
                  <div style={{ color: "var(--secondary)" }}>
                    This group does not have any members yet.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gap: "0.65rem",
                      maxHeight: "260px",
                      overflow: "auto",
                    }}
                  >
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          padding: "0.85rem",
                          borderRadius: "0.85rem",
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--background)",
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "999px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(37, 99, 235, 0.1)",
                            color: "#2563eb",
                          }}
                        >
                          <Phone size={14} />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600 }}>
                            {member.phoneNumber}
                          </p>
                          <p
                            style={{
                              fontSize: "0.78rem",
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
          ) : (
            <div style={{ color: "var(--secondary)" }}>
              Select a group to inspect its client ownership and membership.
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};
