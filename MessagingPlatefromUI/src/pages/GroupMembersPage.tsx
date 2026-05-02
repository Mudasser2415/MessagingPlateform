import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X, Check, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { AddMemberForm, type GroupOption } from "../components/AddMemberForm";
import { Button } from "../components/Button";
import { MembersTable } from "../components/MembersTable";
import { SearchInput } from "../components/SearchInput";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  groupService,
  type GetGroupMembersParams,
  type GroupDto,
  type GroupMemberDto,
  type GroupMembersPageResponse,
} from "../services/groupService";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import {
  getMobileValidationError,
  normalizeIndianMobileNumber,
} from "../utils/mobileValidation";
import type { CSVPreviewRow } from "../components/PreviewTable";

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
type KnownFilter = "all" | "known" | "unknown";

export const GroupMembersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const selectedClientId = useAuthStore((state) => state.selectedClientId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [search, setSearch] = useState("");
  const [knownFilter, setKnownFilter] = useState<KnownFilter>("all");
  const [manualPhone, setManualPhone] = useState("");
  const [manualPhoneError, setManualPhoneError] = useState<
    string | undefined
  >();
  const [csvRows, setCSVRows] = useState<CSVPreviewRow[]>([]);
  const [csvFileName, setCSVFileName] = useState<string | undefined>();
  const [togglingMemberId, setTogglingMemberId] = useState<string | null>(null);
  const [deletingMember, setDeletingMember] = useState<GroupMemberDto | null>(
    null,
  );
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const debouncedSearch = useDebouncedValue(search, 300);
  const selectedGroupId = searchParams.get("groupId") ?? "";

  const { data: groups = [], isLoading: groupsLoading } = useQuery<GroupDto[]>({
    queryKey: ["groups"],
    queryFn: groupService.getGroups,
  });

  const availableGroups = useMemo(
    () =>
      groups.filter(
        (group) => !selectedClientId || group.clientId === selectedClientId,
      ),
    [groups, selectedClientId],
  );

  const groupOptions = useMemo<GroupOption[]>(
    () =>
      availableGroups.map((g) => ({
        groupId: g.groupId,
        groupName: g.groupName,
      })),
    [availableGroups],
  );

  const selectedGroup =
    availableGroups.find((group) => group.groupId === selectedGroupId) ?? null;

  useEffect(() => {
    if (availableGroups.length === 0 || selectedGroup) {
      return;
    }

    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.set("groupId", availableGroups[0].groupId);
        return nextParams;
      },
      { replace: true },
    );
  }, [availableGroups, selectedGroup, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, knownFilter, pageSize, selectedGroupId]);

  const memberFilters = useMemo<GetGroupMembersParams>(
    () => ({
      searchTerm: debouncedSearch || undefined,
      isKnownContact:
        knownFilter === "all" ? undefined : knownFilter === "known",
      page,
      pageSize,
    }),
    [debouncedSearch, knownFilter, page, pageSize],
  );

  const membersQueryKey = [
    "group-members-page",
    selectedGroupId,
    memberFilters.searchTerm || "",
    knownFilter,
    page,
    pageSize,
  ];

  const membersQuery = useQuery<GroupMembersPageResponse>({
    queryKey: membersQueryKey,
    queryFn: () =>
      groupService.getGroupMembersPage(selectedGroupId, memberFilters),
    enabled: Boolean(selectedGroupId),
  });

  const addMembersMutation = useMutation({
    mutationFn: (phoneNumbers: string[]) =>
      groupService.addGroupMembers(selectedGroupId, phoneNumbers),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["group-members-page", selectedGroupId],
      });
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (name: string) =>
      groupService.createGroup({
        groupName: name,
        clientId: selectedClientId ?? "",
      }),
    onSuccess: (newGroupId) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      setShowCreateModal(false);
      setNewGroupName("");
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("groupId", newGroupId);
          return next;
        },
        { replace: true },
      );
      addToast("Group created successfully.", "success");
    },
    onError: () => {
      addToast("Failed to create group.", "error");
    },
  });

  const handleManualAdd = () => {
    if (!selectedGroupId) {
      addToast("Select a group before adding members.", "error");
      return;
    }

    const nextError = getMobileValidationError(manualPhone, {
      required: true,
      emptyMessage: "Phone number is required.",
    });

    setManualPhoneError(nextError);
    if (nextError) {
      return;
    }

    addMembersMutation.mutate([normalizeIndianMobileNumber(manualPhone)], {
      onSuccess: () => {
        setManualPhone("");
        setManualPhoneError(undefined);
        setPage(1);
        addToast("Member added successfully.", "success");
      },
      onError: () => {
        addToast("Unable to add member right now.", "error");
      },
    });
  };

  const handleCSVSubmit = () => {
    if (!selectedGroupId) {
      addToast("Select a group before uploading a CSV.", "error");
      return;
    }

    const validPhoneNumbers = csvRows
      .filter((row) => row.status === "Valid")
      .map((row) => row.normalizedPhoneNumber);

    if (validPhoneNumbers.length === 0) {
      addToast("The CSV preview does not contain any valid rows.", "error");
      return;
    }

    addMembersMutation.mutate(validPhoneNumbers, {
      onSuccess: () => {
        setCsvState();
        setPage(1);
        addToast("Valid CSV members added successfully.", "success");
      },
      onError: () => {
        addToast("Unable to add CSV members right now.", "error");
      },
    });
  };

  const handleToggleKnownContact = async (
    member: GroupMemberDto,
    nextValue: boolean,
  ) => {
    setTogglingMemberId(member.id);
    const previousData =
      queryClient.getQueryData<GroupMembersPageResponse>(membersQueryKey);

    queryClient.setQueryData<GroupMembersPageResponse | undefined>(
      membersQueryKey,
      (currentData) =>
        currentData
          ? {
              ...currentData,
              items: currentData.items.map((item) =>
                item.id === member.id
                  ? { ...item, isKnownContact: nextValue }
                  : item,
              ),
            }
          : currentData,
    );

    try {
      const updatedMember = await groupService.toggleKnownContact(member.id, {
        isKnownContact: nextValue,
      });

      queryClient.setQueryData<GroupMembersPageResponse | undefined>(
        membersQueryKey,
        (currentData) =>
          currentData
            ? {
                ...currentData,
                items: currentData.items.map((item) =>
                  item.id === updatedMember.id ? updatedMember : item,
                ),
              }
            : currentData,
      );

      addToast(
        updatedMember.isKnownContact
          ? "Member marked as known contact."
          : "Member marked as unknown contact.",
        "success",
      );
    } catch {
      queryClient.setQueryData(membersQueryKey, previousData);
      addToast("Unable to update contact classification.", "error");
    } finally {
      queryClient.invalidateQueries({
        queryKey: ["group-members-page", selectedGroupId],
      });
      setTogglingMemberId(null);
    }
  };

  const confirmDeleteMember = () => {
    if (!deletingMember) {
      return;
    }

    const previousData =
      queryClient.getQueryData<GroupMembersPageResponse>(membersQueryKey);
    setDeletingMemberId(deletingMember.id);

    queryClient.setQueryData<GroupMembersPageResponse | undefined>(
      membersQueryKey,
      (currentData) => {
        if (!currentData) {
          return currentData;
        }

        return {
          ...currentData,
          items: currentData.items.filter(
            (item) => item.id !== deletingMember.id,
          ),
          totalCount: Math.max(currentData.totalCount - 1, 0),
          totalPages:
            Math.max(currentData.totalCount - 1, 0) === 0
              ? 0
              : Math.ceil(
                  Math.max(currentData.totalCount - 1, 0) /
                    currentData.pageSize,
                ),
        };
      },
    );

    groupService
      .deleteGroupMember(deletingMember.id)
      .then(() => {
        addToast("Member deleted successfully.", "success");
        if ((previousData?.items.length ?? 0) === 1 && page > 1) {
          setPage((currentPage) => Math.max(currentPage - 1, 1));
        }
      })
      .catch(() => {
        queryClient.setQueryData(membersQueryKey, previousData);
        addToast("Unable to delete member right now.", "error");
      })
      .finally(() => {
        queryClient.invalidateQueries({
          queryKey: ["group-members-page", selectedGroupId],
        });
        setDeletingMemberId(null);
        setDeletingMember(null);
      });
  };

  const setCsvState = (rows: CSVPreviewRow[] = [], fileName?: string) => {
    setCSVRows(rows);
    setCSVFileName(fileName);
  };

  return (
    <div style={{ display: "grid", gap: "1.5rem" }}>
      {/* <section
        style={{
          padding: "1.75rem",
          borderRadius: "1rem",
          border: "1px solid rgba(37, 99, 235, 0.16)",
          background:
            "linear-gradient(135deg, rgba(219, 234, 254, 0.88), rgba(239, 246, 255, 0.72))",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.76rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#2563eb",
            }}
          >
            Group Members
          </p>
          Add members, upload CSV files, classify known contacts, and keep the
          selected group clean without leaving the dashboard.
          <h1
            style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.45rem" }}
          >
            Group Members
          </h1>
          <p style={{ color: "var(--secondary)", marginTop: "0.65rem" }}>
            Add members, upload CSV files, classify known contacts, and keep the
            selected group clean without leaving the dashboard.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1rem",
            padding: "1rem",
            borderRadius: "1rem",
            backgroundColor: "rgba(255, 255, 255, 0.72)",
            border: "1px solid rgba(148, 163, 184, 0.18)",
          }}
        >
          <label style={{ display: "grid", gap: "0.45rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700 }}>Group</span>
            <select
              value={selectedGroupId}
              onChange={(event) => {
                const nextGroupId = event.target.value;
                setSearchParams((currentParams) => {
                  const nextParams = new URLSearchParams(currentParams);
                  nextParams.set("groupId", nextGroupId);
                  return nextParams;
                });
              }}
              className="form-input"
              disabled={groupsLoading || availableGroups.length === 0}
            >
              {availableGroups.length === 0 ? (
                <option value="">No groups available</option>
              ) : null}
              {availableGroups.map((group) => (
                <option key={group.groupId} value={group.groupId}>
                  {group.groupName}
                </option>
              ))}
            </select>
          </label>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <div>
            
              <p style={{ fontSize: "0.78rem", color: "var(--secondary)" }}>
                Selected Group Name
              </p>
              <p style={{ fontSize: "1rem", fontWeight: 800 }}>
                {selectedGroup?.groupName || "No group selected"}
              </p>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.5rem 0.8rem",
                borderRadius: 999,
                backgroundColor: "rgba(37, 99, 235, 0.1)",
                color: "#2563eb",
                fontWeight: 700,
                fontSize: "0.82rem",
                alignSelf: "flex-start",
              }}
            >
              <Users size={14} />
              Total Members: {membersQuery.data?.totalCount ?? 0}
            </div>
          </div>
        </div>
      </section> */}

      <AddMemberForm
        disabled={!selectedGroupId}
        groupName={selectedGroup?.groupName}
        groups={groupOptions}
        selectedGroupId={selectedGroupId}
        groupsLoading={groupsLoading}
        onGroupChange={(id) =>
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.set("groupId", id);
              return next;
            },
            { replace: true },
          )
        }
        onCreateGroup={() => {
          setNewGroupName("");
          setShowCreateModal(true);
        }}
        manualPhone={manualPhone}
        manualPhoneError={manualPhoneError}
        isAddingMember={addMembersMutation.isPending}
        isSubmittingCsv={addMembersMutation.isPending}
        csvFileName={csvFileName}
        csvRows={csvRows}
        onManualPhoneChange={(value) => {
          setManualPhone(value);
          if (manualPhoneError) {
            setManualPhoneError(undefined);
          }
        }}
        onAddMember={handleManualAdd}
        onCSVRowsParsed={(rows, fileName) => {
          setCsvState(rows, fileName);
        }}
        onCSVError={(message) => addToast(message, "error")}
        onSubmitCSV={handleCSVSubmit}
        onClearCSV={() => setCsvState()}
      />

      <section className="stat-card" style={{ display: "grid", gap: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800 }}>Filters</h2>
            <p style={{ color: "var(--secondary)", fontSize: "0.84rem" }}>
              Search by phone number and filter by known-contact state.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
              alignItems: "center",
              width: "100%",
              maxWidth: 720,
            }}
          >
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search by phone number"
            />
            <select
              value={knownFilter}
              onChange={(event) =>
                setKnownFilter(event.target.value as KnownFilter)
              }
              className="form-input"
              style={{ width: 180, marginBottom: 0 }}
            >
              <option value="all">All Contacts</option>
              <option value="known">Known</option>
              <option value="unknown">Unknown</option>
            </select>
            <select
              value={String(pageSize)}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="form-input"
              style={{ width: 140, marginBottom: 0 }}
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setKnownFilter("all");
                setPageSize(10);
                setPage(1);
              }}
              style={{ width: "auto", paddingInline: "1rem" }}
            >
              <Upload size={16} /> Reset
            </Button>
          </div>
        </div>
      </section>

      <MembersTable
        data={membersQuery.data}
        isLoading={membersQuery.isLoading || groupsLoading}
        error={
          membersQuery.error instanceof Error
            ? membersQuery.error.message
            : null
        }
        togglingMemberId={togglingMemberId}
        deletingMemberId={deletingMemberId}
        onToggleKnownContact={handleToggleKnownContact}
        onDeleteMember={setDeletingMember}
        onPageChange={setPage}
      />

      {deletingMember ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.5rem",
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              backgroundColor: "var(--card)",
              borderRadius: "1rem",
              border: "1px solid var(--border)",
              padding: "1.5rem",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                Delete member?
              </h3>
              <p style={{ color: "var(--secondary)", marginTop: "0.4rem" }}>
                Remove {deletingMember.phoneNumber} from{" "}
                {selectedGroup?.groupName || "this group"}. This action cannot
                be undone.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
              }}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeletingMember(null)}
                style={{ width: "auto", paddingInline: "1rem" }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDeleteMember}
                style={{
                  width: "auto",
                  paddingInline: "1rem",
                  backgroundColor: "#b91c1c",
                }}
              >
                Delete Member
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showCreateModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 440,
              backgroundColor: "var(--card)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
              overflow: "hidden",
            }}
          >
            {/* header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "0.5rem",
                    backgroundColor: "rgba(37,99,235,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus size={18} color="#2563eb" />
                </div>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>
                  Create Group
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={createGroupMutation.isPending}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "0.375rem",
                  border: "1px solid var(--border)",
                  background: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--secondary)",
                  cursor: "pointer",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <div style={{ padding: "1.5rem" }}>
              <label className="form-label">Group Name</label>
              <input
                className="form-input"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Enter" &&
                    newGroupName.trim() &&
                    !createGroupMutation.isPending
                  ) {
                    createGroupMutation.mutate(newGroupName.trim());
                  }
                }}
                placeholder="e.g. Sales Team"
                autoFocus
                disabled={createGroupMutation.isPending}
              />
            </div>

            {/* footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--border)",
                display: "flex",
                gap: "0.75rem",
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
                style={{ width: "auto", paddingInline: "1.25rem" }}
                disabled={createGroupMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createGroupMutation.mutate(newGroupName.trim())}
                style={{ width: "auto", paddingInline: "1.25rem" }}
                disabled={!newGroupName.trim() || createGroupMutation.isPending}
                isLoading={createGroupMutation.isPending}
              >
                {!createGroupMutation.isPending && (
                  <>
                    <Check size={16} /> Create
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
