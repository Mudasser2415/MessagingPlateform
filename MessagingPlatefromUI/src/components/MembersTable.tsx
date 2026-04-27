import React from "react";
import { Phone, Trash2, Users } from "lucide-react";
import type {
  GroupMemberDto,
  GroupMembersPageResponse,
} from "../services/groupService";
import { Button } from "./Button";
import { Loader } from "./Loader";
import { Pagination } from "./Pagination";
import { ToggleSwitch } from "./ToggleSwitch";

interface MembersTableProps {
  data?: GroupMembersPageResponse;
  isLoading: boolean;
  error?: string | null;
  togglingMemberId: string | null;
  deletingMemberId: string | null;
  onToggleKnownContact: (
    member: GroupMemberDto,
    nextValue: boolean,
  ) => Promise<void>;
  onDeleteMember: (member: GroupMemberDto) => void;
  onPageChange: (page: number) => void;
}

export const MembersTable: React.FC<MembersTableProps> = ({
  data,
  isLoading,
  error,
  togglingMemberId,
  deletingMemberId,
  onToggleKnownContact,
  onDeleteMember,
  onPageChange,
}) => {
  return (
    <section className="stat-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "1.1rem 1.25rem",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>Members Table</h3>
          <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
            Toggle known contacts, search by phone number, and remove members
            without leaving the page.
          </p>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.5rem 0.8rem",
            borderRadius: 999,
            backgroundColor: "rgba(15, 118, 110, 0.12)",
            color: "#0f766e",
            fontWeight: 700,
            fontSize: "0.82rem",
          }}
        >
          <Users size={14} /> Total Members: {data?.totalCount ?? 0}
        </div>
      </div>

      {isLoading ? (
        <Loader label="Loading group members..." />
      ) : error ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#b91c1c" }}>
          {error}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              margin: "0 auto 1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(148, 163, 184, 0.12)",
              color: "var(--secondary)",
            }}
          >
            <Users size={28} />
          </div>
          <h4 style={{ fontSize: "1rem", fontWeight: 800 }}>
            No members found
          </h4>
          <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
            Add members manually or upload a CSV to populate this group.
          </p>
        </div>
      ) : (
        <div style={{ padding: "0 1.25rem 1.1rem" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 720,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={memberHeaderCellStyle}>Phone Number</th>
                  <th style={memberHeaderCellStyle}>Known Contact</th>
                  <th style={memberHeaderCellStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((member, index) => (
                  <tr
                    key={member.id}
                    style={{
                      borderBottom:
                        index === data.items.length - 1
                          ? "none"
                          : "1px solid var(--border)",
                    }}
                  >
                    <td style={memberBodyCellStyle}>
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
                            backgroundColor: "rgba(37, 99, 235, 0.12)",
                            color: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Phone size={16} />
                        </div>
                        <span style={{ fontWeight: 700 }}>
                          {member.phoneNumber}
                        </span>
                      </div>
                    </td>
                    <td style={memberBodyCellStyle}>
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
                              fontSize: "0.78rem",
                              color: "var(--secondary)",
                            }}
                          >
                            {member.isKnownContact
                              ? "Marked for familiar-contact follow-up"
                              : "Currently treated as an unknown contact"}
                          </p>
                        </div>
                        <ToggleSwitch
                          checked={member.isKnownContact}
                          disabled={togglingMemberId === member.id}
                          onChange={(checked) =>
                            void onToggleKnownContact(member, checked)
                          }
                        />
                      </div>
                    </td>
                    <td style={memberBodyCellStyle}>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onDeleteMember(member)}
                        disabled={deletingMemberId === member.id}
                        style={{
                          width: "auto",
                          paddingInline: "0.95rem",
                          color: "#b91c1c",
                          borderColor: "rgba(185, 28, 28, 0.2)",
                        }}
                      >
                        <Trash2 size={15} /> Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            totalCount={data.totalCount}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
};

const memberHeaderCellStyle: React.CSSProperties = {
  padding: "0.82rem 1rem",
  textAlign: "left",
  fontSize: "0.74rem",
  fontWeight: 700,
  color: "var(--secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const memberBodyCellStyle: React.CSSProperties = {
  padding: "1rem",
  verticalAlign: "middle",
};
