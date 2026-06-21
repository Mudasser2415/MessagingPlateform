import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Eye,
  X,
  Check,
  Search,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { groupService } from "../services/groupService";
import type { GroupDto } from "../services/groupService";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/Button";
import { CSVUploadModal } from "../components/CSVUploadModal";
import { GroupSelectorModal } from "../components/GroupSelectorModal";
import { Loader } from "../components/Loader";
import { useToastStore } from "../store/toastStore";

/* ─── helpers ─────────────────────────────────────────── */
type ModalMode = "edit" | "delete" | null;

/* ─── Edit Modal ───────────────────────────────────────── */
const EditModal: React.FC<{
  group: GroupDto;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  saving: boolean;
}> = ({ group, onClose, onSave, saving }) => {
  const [name, setName] = useState(group.groupName);
  return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth: 440 }}>
        <div style={modalHeader}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div style={iconWrap("#6366f1")}>
              <Edit2 size={18} color="#6366f1" />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>
              Edit Group
            </h2>
          </div>
          <button onClick={onClose} style={closeBtn}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <label className="form-label">Group Name</label>
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
          />
        </div>

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
            onClick={onClose}
            variant="outline"
            style={{ width: "auto", paddingInline: "1.25rem" }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(name)}
            style={{ width: "auto", paddingInline: "1.25rem" }}
            disabled={saving || !name.trim()}
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Check size={16} /> Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Delete Confirm Modal ─────────────────────────────── */
const DeleteModal: React.FC<{
  group: GroupDto;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  deleting: boolean;
}> = ({ group, onClose, onConfirm, deleting }) => (
  <div style={overlay}>
    <div style={{ ...modal, maxWidth: 420 }}>
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div
          style={{
            ...iconWrap("#ef4444"),
            width: 56,
            height: 56,
            margin: "0 auto 1rem",
            borderRadius: "50%",
          }}
        >
          <AlertTriangle size={26} color="#ef4444" />
        </div>
        <h2
          style={{
            fontWeight: 700,
            fontSize: "1.25rem",
            marginBottom: "0.5rem",
          }}
        >
          Delete Group?
        </h2>
        <p style={{ color: "var(--secondary)", fontSize: "0.875rem" }}>
          Are you sure you want to delete <strong>"{group.groupName}"</strong>?
          This will remove all associated members and cannot be undone.
        </p>
      </div>
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
          onClick={onClose}
          variant="outline"
          style={{ width: "auto", paddingInline: "1.25rem" }}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          style={{
            width: "auto",
            paddingInline: "1.25rem",
            backgroundColor: "#ef4444",
          }}
          disabled={deleting}
        >
          {deleting ? (
            "Deleting…"
          ) : (
            <>
              <Trash2 size={16} /> Delete
            </>
          )}
        </Button>
      </div>
    </div>
  </div>
);

/* ─── Create Group Modal ───────────────────────────────── */
const CreateGroupModal: React.FC<{
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
  creating: boolean;
}> = ({ onClose, onCreate, creating }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }
    setError("");
    await onCreate(name.trim());
  };

  return (
    <div style={overlay}>
      <div style={{ ...modal, maxWidth: 480 }}>
        <div style={modalHeader}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div style={iconWrap("#6366f1")}>
              <Plus size={18} color="#6366f1" />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>
              Create Group
            </h2>
          </div>
          <button onClick={onClose} style={closeBtn}>
            <X size={18} />
          </button>
        </div>

        <div
          style={{
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Group Name */}
          <div>
            <label className="form-label">
              Group Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
          </div>

          {error && (
            <div
              style={{
                padding: "0.6rem 0.875rem",
                borderRadius: "0.375rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <AlertTriangle size={14} /> {error}
            </div>
          )}
        </div>

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
            onClick={onClose}
            variant="outline"
            style={{ width: "auto", paddingInline: "1.25rem" }}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            style={{ width: "auto", paddingInline: "1.25rem" }}
            disabled={creating || !name.trim()}
          >
            {creating ? (
              "Creating…"
            ) : (
              <>
                <Plus size={16} /> Create Group
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ────────────────────────────────────────── */
export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedClientId } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const qc = useQueryClient();

  /* form state */
  const [search, setSearch] = useState("");
  const [memberFilter, setMemberFilter] = useState<
    "all" | "withMembers" | "empty"
  >("all");
  const [sortOrder, setSortOrder] = useState<
    "latest" | "oldest" | "nameAsc" | "nameDesc"
  >("latest");
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvGroupId, setCSVGroupId] = useState<string | null>(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  /* modal state */
  const [activeGroup, setActiveGroup] = useState<GroupDto | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);

  /* modal mutation flags */
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ── queries ── */
  const { data: groups = [], isLoading } = useQuery<GroupDto[]>({
    queryKey: ["groups"],
    queryFn: groupService.getGroups,
  });

  /* ── create mutation ── */
  const createMutation = useMutation({
    mutationFn: async ({
      name,
      phonesList,
    }: {
      name: string;
      phonesList: string[];
    }) => {
      if (!selectedClientId) {
        throw new Error("Select a client before creating a group.");
      }
      return groupService.createGroupWithBulkPhones(
        name,
        selectedClientId,
        phonesList,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      addToast("Group created successfully.", "success");
      setShowCreateGroupModal(false);
    },
  });

  /* ── CSV upload mutation for existing group ── */
  const csvUploadMutation = useMutation({
    mutationFn: async (phoneNumbers: string[]) => {
      if (!csvGroupId) throw new Error("No group selected");
      await groupService.updateGroupMembers(csvGroupId, phoneNumbers);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] });
      setShowCSVModal(false);
      setCSVGroupId(null);
    },
    onError: () => {
      // Error will be handled by the modal
    },
  });

  /* ── open modal ── */
  const openModal = async (group: GroupDto, mode: ModalMode) => {
    setActiveGroup(group);
    setModalMode(mode);
  };

  const closeModal = () => {
    setActiveGroup(null);
    setModalMode(null);
  };

  /* ── edit save ── */
  const handleEditSave = async (name: string) => {
    if (!activeGroup) return;
    setSaving(true);
    try {
      await groupService.updateGroup(activeGroup.groupId, { groupName: name });
      qc.invalidateQueries({ queryKey: ["groups"] });
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  /* ── delete confirm ── */
  const handleDeleteConfirm = async () => {
    if (!activeGroup) return;
    setDeleting(true);
    try {
      await groupService.deleteGroup(activeGroup.groupId);
      qc.invalidateQueries({ queryKey: ["groups"] });
      closeModal();
    } finally {
      setDeleting(false);
    }
  };

  const filtered = groups
    .filter(
      (g) =>
        (!selectedClientId || g.clientId === selectedClientId) &&
        g.groupName.toLowerCase().includes(search.toLowerCase()),
    )
    .filter((g) => {
      if (memberFilter === "withMembers") {
        return g.memberCount > 0;
      }

      if (memberFilter === "empty") {
        return g.memberCount === 0;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === "latest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      if (sortOrder === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }

      if (sortOrder === "nameAsc") {
        return a.groupName.localeCompare(b.groupName);
      }

      return b.groupName.localeCompare(a.groupName);
    });

  /* ─────────────────────────────────────────────── */
  return (
    <div className="animate-fade-in">
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
                Group Directory
              </h2>
              <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                Search groups, filter by member volume, and open member details
                quickly.
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
                onClick={() => setShowCreateGroupModal(true)}
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
                {filtered.length} showing
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.6fr) minmax(180px, 0.7fr) minmax(180px, 0.7fr)",
              gap: "0.85rem",
            }}
          >
            <div style={{ position: "relative" }}>
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
                className="form-input"
                placeholder="Search by group name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ marginBottom: 0, paddingLeft: "2.5rem" }}
              />
            </div>

            <select
              className="form-input"
              value={memberFilter}
              onChange={(e) =>
                setMemberFilter(
                  e.target.value as "all" | "withMembers" | "empty",
                )
              }
              style={{ marginBottom: 0 }}
            >
              <option value="all">All member types</option>
              <option value="withMembers">With members</option>
              <option value="empty">No members</option>
            </select>

            <select
              className="form-input"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(
                  e.target.value as
                    | "latest"
                    | "oldest"
                    | "nameAsc"
                    | "nameDesc",
                )
              }
              style={{ marginBottom: 0 }}
            >
              <option value="latest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="nameAsc">Name A-Z</option>
              <option value="nameDesc">Name Z-A</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <Loader label="Loading groups..." />
        ) : filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Users size={42} style={{ opacity: 0.45, marginBottom: "1rem" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
              {search ? "No groups match your search" : "No groups found"}
            </h3>
            <p style={{ color: "var(--secondary)", marginTop: "0.5rem" }}>
              {search
                ? "Try broadening your search or changing filters."
                : "Create your first group to get started."}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>Group</th>
                  <th>Members</th>
                  <th>Client</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((group) => (
                  <tr key={group.groupId}>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="View members"
                          onClick={() =>
                            navigate(`/groups/members?groupId=${group.groupId}`)
                          }
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="Edit group"
                          onClick={() => openModal(group, "edit")}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="Delete group"
                          onClick={() => openModal(group, "delete")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700 }}>{group.groupName}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          backgroundColor: "rgba(99,102,241,0.1)",
                          color: "var(--primary)",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        <Users size={12} /> {group.memberCount}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: "var(--secondary)",
                          fontSize: "0.82rem",
                        }}
                      >
                        {group.clientId}
                      </span>
                    </td>
                    <td>
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).format(new Date(group.createdAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Modals ── */}
      {showCSVModal && !csvGroupId && (
        <GroupSelectorModal
          groups={groups}
          onSelectGroup={(groupId) => {
            setCSVGroupId(groupId);
          }}
          onClose={() => setShowCSVModal(false)}
        />
      )}

      {showCSVModal && csvGroupId && (
        <CSVUploadModal
          title="Upload Phone Numbers to Group"
          description="Upload a CSV file containing phone numbers to update this group's member list. The new numbers will replace the existing ones."
          onClose={() => {
            setShowCSVModal(false);
            setCSVGroupId(null);
          }}
          onUpload={(phoneNumbers) =>
            csvUploadMutation.mutateAsync(phoneNumbers)
          }
          isLoading={csvUploadMutation.isPending}
        />
      )}

      {showCreateGroupModal && (
        <CreateGroupModal
          onClose={() => setShowCreateGroupModal(false)}
          onCreate={async (name) => {
            await createMutation.mutateAsync({ name, phonesList: [] });
          }}
          creating={createMutation.isPending}
        />
      )}

      {activeGroup && modalMode === "edit" && (
        <EditModal
          group={activeGroup}
          onClose={closeModal}
          onSave={handleEditSave}
          saving={saving}
        />
      )}
      {activeGroup && modalMode === "delete" && (
        <DeleteModal
          group={activeGroup}
          onClose={closeModal}
          onConfirm={handleDeleteConfirm}
          deleting={deleting}
        />
      )}
    </div>
  );
};

const iconWrap = (color: string): React.CSSProperties => ({
  width: 36,
  height: 36,
  borderRadius: "0.5rem",
  backgroundColor: `${color}15`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  backgroundColor: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  animation: "fadeIn 0.15s ease",
};

const modal: React.CSSProperties = {
  width: "100%",
  backgroundColor: "var(--card)",
  borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
  overflow: "hidden",
  animation: "fadeIn 0.2s ease",
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.25rem 1.5rem",
  borderBottom: "1px solid var(--border)",
};

const closeBtn: React.CSSProperties = {
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
};
