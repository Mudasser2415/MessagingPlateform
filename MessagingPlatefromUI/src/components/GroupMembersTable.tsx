import React from "react";
import { BadgeCheck, Phone, X } from "lucide-react";
import type { GroupDto, GroupMemberDto } from "../services/groupService";
import { Button } from "./Button";
import { Loader } from "./Loader";
import { ToggleSwitch } from "./ToggleSwitch";

interface GroupMembersTableProps {
  group: GroupDto;
  members: GroupMemberDto[];
  loading: boolean;
  togglingMemberId: string | null;
  onToggleKnownContact: (
    memberId: string,
    isKnownContact: boolean,
  ) => Promise<void>;
  onClose: () => void;
}

export const GroupMembersTable: React.FC<GroupMembersTableProps> = ({
  group,
  members,
  loading,
  togglingMemberId,
  onToggleKnownContact,
  onClose,
}) => {
  return (
    <section className="stat-card" style={{ marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.76rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#16a34a",
              marginBottom: "0.35rem",
            }}
          >
            Group Members
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {group.groupName}
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.28rem 0.7rem",
                borderRadius: 999,
                backgroundColor: "rgba(22, 163, 74, 0.12)",
                color: "#15803d",
                fontSize: "0.78rem",
                fontWeight: 700,
              }}
            >
              <BadgeCheck size={12} />
              {members.length} Member{members.length !== 1 ? "s" : ""}
            </span>
          </div>
          <p
            style={{
              marginTop: "0.35rem",
              color: "var(--secondary)",
              fontSize: "0.84rem",
            }}
          >
            Toggle each member inline to mark them as a known or unknown
            contact.
          </p>
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          style={{ width: "auto", paddingInline: "1rem" }}
        >
          <X size={14} /> Hide
        </Button>
      </div>

      {loading ? (
        <Loader label="Loading group members..." />
      ) : members.length === 0 ? (
        <div
          style={{
            padding: "2.5rem",
            border: "1px dashed var(--border)",
            borderRadius: "0.85rem",
            textAlign: "center",
            color: "var(--secondary)",
          }}
        >
          This group does not have any members yet.
        </div>
      ) : (
        <div className="table-scroll-container">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 520,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  style={{
                    padding: "0.85rem 1rem",
                    textAlign: "left",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    color: "var(--secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Phone Number
                </th>
                <th
                  style={{
                    padding: "0.85rem 1rem",
                    textAlign: "left",
                    fontSize: "0.76rem",
                    fontWeight: 700,
                    color: "var(--secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Known Contact
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, index) => (
                <tr
                  key={member.id}
                  style={{
                    borderBottom:
                      index === members.length - 1
                        ? "none"
                        : "1px solid var(--border)",
                  }}
                >
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.7rem",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(59, 130, 246, 0.12)",
                          color: "#2563eb",
                          flexShrink: 0,
                        }}
                      >
                        <Phone size={15} />
                      </div>
                      <div>
                        <p style={{ fontWeight: 600 }}>{member.phoneNumber}</p>
                        <p
                          style={{
                            fontSize: "0.76rem",
                            color: "var(--secondary)",
                          }}
                        >
                          {member.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontWeight: 700,
                            color: member.isKnownContact
                              ? "#15803d"
                              : "#64748b",
                          }}
                        >
                          {member.isKnownContact ? "Known" : "Unknown"}
                        </p>
                        <p
                          style={{
                            fontSize: "0.76rem",
                            color: "var(--secondary)",
                          }}
                        >
                          {member.isKnownContact
                            ? "Contact is classified as known"
                            : "Contact is classified as unknown"}
                        </p>
                      </div>
                      <ToggleSwitch
                        checked={member.isKnownContact}
                        disabled={togglingMemberId === member.id}
                        title="Mark as Known Contact"
                        onChange={(checked) =>
                          void onToggleKnownContact(member.id, checked)
                        }
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
