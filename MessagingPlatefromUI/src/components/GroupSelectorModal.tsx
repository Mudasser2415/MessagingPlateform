import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import type { GroupDto } from "../services/groupService";

interface GroupSelectorModalProps {
  groups: GroupDto[];
  onSelectGroup: (groupId: string) => void;
  onClose: () => void;
}

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 999,
  padding: "12px",
};

const modal = {
  backgroundColor: "var(--card)",
  borderRadius: "0.75rem",
  border: "1px solid var(--border)",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
  maxWidth: 500,
  width: "100%",
  maxHeight: "calc(100dvh - 24px)",
  overflowY: "auto" as const,
};

const closeBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--secondary)",
  padding: "0.25rem",
  display: "flex",
  alignItems: "center",
};

export const GroupSelectorModal: React.FC<GroupSelectorModalProps> = ({
  groups,
  onSelectGroup,
  onClose,
}) => {
  const [search, setSearch] = useState("");

  const filtered = groups.filter((g) =>
    g.groupName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>
            Select Group to Update
          </h2>
          <button onClick={onClose} style={closeBtn as any}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search groups by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginBottom: "1rem" }}
          />

          {filtered.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: "var(--secondary)",
              }}
            >
              {groups.length === 0
                ? "No groups available"
                : "No matching groups"}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              {filtered.map((group) => (
                <button
                  key={group.groupId}
                  onClick={() => onSelectGroup(group.groupId)}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--background)",
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(99, 102, 241, 0.1)";
                    e.currentTarget.style.borderColor = "#6366f1";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--background)";
                    e.currentTarget.style.borderColor = "var(--border)";
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{group.groupName}</div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    Created {new Date(group.createdAt).toLocaleDateString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "0.75rem",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={onClose}
            variant="outline"
            style={{ width: "auto", paddingInline: "1.25rem" }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
