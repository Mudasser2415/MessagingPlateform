import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Trash2,
  Edit2,
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

  const filtered = groups.filter(
    (g) =>
      (!selectedClientId || g.clientId === selectedClientId) &&
      g.groupName.toLowerCase().includes(search.toLowerCase()),
  );

  /* ─────────────────────────────────────────────── */
  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            Groups Management
          </h1>
          <p style={{ color: "var(--secondary)" }}>
            Create groups and manage their phone number members.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              backgroundColor: "rgba(99,102,241,0.1)",
              color: "var(--primary)",
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            <Users size={16} />
            {groups.length} Group{groups.length !== 1 ? "s" : ""}
          </div>
          {groups.length > 0 && (
            <Button
              onClick={() => setShowCSVModal(true)}
              variant="outline"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingInline: "1rem",
                width: "auto",
              }}
            >
              <Upload size={16} /> Bulk Upload
            </Button>
          )}
          <Button
            onClick={() => setShowCreateGroupModal(true)}
            variant="outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              paddingInline: "1rem",
              width: "auto",
            }}
          >
            <Plus size={16} /> Create Group
          </Button>
        </div>
      </div>

      {/* ── Groups Table ── */}
      <div className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Table toolbar */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--secondary)",
              }}
            />
            <input
              className="form-input"
              style={{ paddingLeft: "2.25rem", marginBottom: 0 }}
              placeholder="Search groups…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {isLoading ? (
          <Loader label="Loading groups..." />
        ) : filtered.length === 0 ? (
          <div style={{ padding: "6rem 2rem", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "var(--background)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                color: "var(--secondary)",
              }}
            >
              <Users size={32} />
            </div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              {search ? "No groups match your search" : "No groups yet"}
            </h3>
            <p style={{ color: "var(--secondary)", fontSize: "0.875rem" }}>
              {search
                ? "Try a different keyword."
                : "Use the form above to create your first group."}
            </p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--background)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {["Group Name", "Total Members", "Created At", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.875rem 1.5rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "var(--secondary)",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((group, idx) => (
                <tr
                  key={group.groupId}
                  style={{
                    backgroundColor: "transparent",
                    borderBottom:
                      idx === filtered.length - 1
                        ? "none"
                        : "1px solid var(--border)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--background)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  {/* Group Name */}
                  <td style={{ padding: "1rem 1.5rem" }}>
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
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, #6366f1, #a855f7)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          flexShrink: 0,
                        }}
                      >
                        {group.groupName.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {group.groupName}
                      </span>
                    </div>
                  </td>

                  {/* Member count badge */}
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(99,102,241,0.1)",
                        color: "var(--primary)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                      }}
                    >
                      <Users size={12} /> {group.memberCount}
                    </span>
                  </td>

                  {/* Created At */}
                  <td
                    style={{
                      padding: "1rem 1.5rem",
                      fontSize: "0.875rem",
                      color: "var(--secondary)",
                    }}
                  >
                    {new Date(group.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {/* <ActionBtn
                        title="View Members"
                        color="#6366f1"
                        bg="rgba(99,102,241,0.1)"
                        onClick={() =>
                          navigate(`/groups/members?groupId=${group.groupId}`)
                        }
                      >
                        <Eye size={15} />
                      </ActionBtn> */}

                      <ActionBtn
                        title="Edit"
                        color="#10b981"
                        bg="rgba(16,185,129,0.1)"
                        onClick={() =>
                          navigate(`/groups/members?groupId=${group.groupId}`)
                        }
                      >
                        <Edit2 size={15} />
                      </ActionBtn>

                      <ActionBtn
                        title="Delete"
                        color="#ef4444"
                        bg="rgba(239,68,68,0.1)"
                        onClick={() => openModal(group, "delete")}
                      >
                        <Trash2 size={15} />
                      </ActionBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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

/* ── small helpers ──────────────────────────────────────── */
const ActionBtn: React.FC<{
  title: string;
  color: string;
  bg: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ title, color, bg, onClick, children }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width: 32,
      height: 32,
      borderRadius: "0.4rem",
      border: "none",
      backgroundColor: bg,
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "opacity 0.15s, transform 0.1s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.opacity = "0.75";
      e.currentTarget.style.transform = "scale(1.08)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.opacity = "1";
      e.currentTarget.style.transform = "scale(1)";
    }}
  >
    {children}
  </button>
);

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
