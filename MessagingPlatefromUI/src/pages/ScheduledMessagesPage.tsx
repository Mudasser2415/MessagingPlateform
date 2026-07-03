import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  Send,
  Trash2,
  Phone,
  Users,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { scheduledMessageService } from "../services/scheduledMessageService";
import type { ScheduledMessageDto } from "../services/scheduledMessageService";
import { groupService } from "../services/groupService";
import { messageService } from "../services/messageService";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";
import { getMobileValidationError } from "../utils/mobileValidation";
import { MobileInput } from "../components/MobileInput";

// ─── Status Badge ────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  Scheduled: { bg: "#dbeafe", color: "#1d4ed8", label: "Scheduled" },
  Processing: { bg: "#fef9c3", color: "#a16207", label: "Processing" },
  Completed: { bg: "#dcfce7", color: "#15803d", label: "Completed" },
  Failed: { bg: "#fee2e2", color: "#b91c1c", label: "Failed" },
  Cancelled: { bg: "#f3f4f6", color: "#6b7280", label: "Cancelled" },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES["Scheduled"];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.6rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatLocal(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toLocalDatetimeValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export const ScheduledMessagesPage: React.FC = () => {
  const { selectedClientId } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const queryClient = useQueryClient();

  // ── Form state ──────────────────────────────────────────────────────────────
  const [templateId, setTemplateId] = useState("");
  const [sendType, setSendType] = useState<"group" | "single">("group");
  const [groupId, setGroupId] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | undefined>();

  // default: 1 hour from now
  const [scheduledAt, setScheduledAt] = useState(() =>
    toLocalDatetimeValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [formError, setFormError] = useState("");

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: savedTemplates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["saved-message-templates", selectedClientId],
    queryFn: () =>
      messageService.getSavedTemplates(selectedClientId ?? undefined),
  });

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: groupService.getGroups,
  });

  const {
    data: scheduled = [],
    isLoading: loadingScheduled,
    refetch,
  } = useQuery({
    queryKey: ["scheduled-messages", selectedClientId],
    queryFn: () =>
      scheduledMessageService.getScheduled(selectedClientId ?? undefined),
  });

  const visibleGroups = useMemo(
    () =>
      groups.filter(
        (g: any) => !selectedClientId || g.clientId === selectedClientId,
      ),
    [groups, selectedClientId],
  );

  // ── Schedule mutation ────────────────────────────────────────────────────────
  const scheduleMutation = useMutation({
    mutationFn: () => {
      if (!selectedClientId) throw new Error("No client selected.");
      if (!templateId) throw new Error("Please select a template.");

      if (sendType === "single") {
        const err = getMobileValidationError(phone, {
          required: true,
          emptyMessage: "Phone number is required.",
        });
        if (err) throw new Error(err);
      } else if (!groupId) {
        throw new Error("Please select a group.");
      }

      const picked = new Date(scheduledAt);
      if (isNaN(picked.getTime()) || picked <= new Date(Date.now() + 60_000)) {
        throw new Error(
          "Scheduled time must be at least 1 minute in the future.",
        );
      }

      return scheduledMessageService.schedule({
        clientId: selectedClientId,
        templateId,
        groupId: sendType === "group" ? groupId : undefined,
        phoneNumber: sendType === "single" ? phone : undefined,
        scheduledAt: picked.toISOString(),
      });
    },
    onSuccess: () => {
      addToast("Message scheduled successfully!", "success");
      setTemplateId("");
      setGroupId("");
      setPhone("");
      setPhoneError(undefined);
      setScheduledAt(
        toLocalDatetimeValue(new Date(Date.now() + 60 * 60 * 1000)),
      );
      setFormError("");
      queryClient.invalidateQueries({ queryKey: ["scheduled-messages"] });
    },
    onError: (err: any) => {
      const validationErrors = err?.response?.data?.errors;
      const msg =
        validationErrors && typeof validationErrors === "object"
          ? Object.values(validationErrors).flat().join("; ")
          : err?.response?.data?.message ||
            err?.message ||
            "Failed to schedule message.";
      setFormError(msg);
    },
  });

  // ── Cancel mutation ──────────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: (id: string) => scheduledMessageService.cancel(id),
    onSuccess: () => {
      addToast("Scheduled message cancelled.", "success");
      queryClient.invalidateQueries({ queryKey: ["scheduled-messages"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message || err?.message || "Cancel failed.";
      addToast(msg, "error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (sendType === "single") {
      const err = getMobileValidationError(phone, {
        required: true,
        emptyMessage: "Phone number is required.",
      });
      setPhoneError(err);
      if (err) return;
    }
    scheduleMutation.mutate();
  };

  // ── Min datetime for the picker (1 min from now) ────────────────────────────
  const minDatetime = toLocalDatetimeValue(new Date(Date.now() + 60_000));

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>
          Scheduled Messages
        </h1>
        <p style={{ color: "var(--secondary)" }}>
          Schedule WhatsApp messages for future delivery.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        {/* ── Schedule Form ─────────────────────────────────────────── */}
        <div className="stat-card">
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "1.25rem",
            }}
          >
            New Scheduled Message
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Template */}
              <div>
                <label className="form-label">
                  Template <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="form-input"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  disabled={loadingTemplates}
                  required
                >
                  <option value="">-- Choose a template --</option>
                  {savedTemplates.map((t) => (
                    <option key={t.templateId} value={t.templateId}>
                      {t.templateName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Send type toggle */}
              <div>
                <label
                  className="form-label"
                  style={{ marginBottom: "0.5rem" }}
                >
                  Send To
                </label>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  {(["group", "single"] as const).map((type) => (
                    <label
                      key={type}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        cursor: "pointer",
                        padding: "0.6rem 0.75rem",
                        border: `1px solid ${sendType === type ? "var(--primary)" : "var(--border)"}`,
                        borderRadius: "0.5rem",
                        backgroundColor:
                          sendType === type
                            ? "rgba(99,102,241,0.06)"
                            : "transparent",
                        fontSize: "0.875rem",
                      }}
                    >
                      <input
                        type="radio"
                        name="sendType"
                        value={type}
                        checked={sendType === type}
                        onChange={() => setSendType(type)}
                      />
                      {type === "group" ? (
                        <Users size={14} />
                      ) : (
                        <Phone size={14} />
                      )}
                      <span style={{ fontWeight: 500 }}>
                        {type === "group" ? "Group" : "Single"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Group selector or phone input */}
              {sendType === "group" ? (
                <div>
                  <label className="form-label">
                    Group <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    disabled={loadingGroups}
                    required
                  >
                    <option value="">-- Choose a group --</option>
                    {visibleGroups.map((g: any) => (
                      <option key={g.groupId} value={g.groupId}>
                        {g.groupName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <MobileInput
                  label="Phone Number"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(v) => {
                    setPhone(v);
                    if (phoneError) setPhoneError(undefined);
                  }}
                  error={phoneError}
                  showPrefix
                  required
                />
              )}

              {/* Date & Time Picker */}
              <div>
                <label className="form-label">
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Calendar size={14} />
                    Scheduled Date & Time{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </span>
                </label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={scheduledAt}
                  min={minDatetime}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  required
                />
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--secondary)",
                    marginTop: "0.2rem",
                  }}
                >
                  Your local time. Must be at least 1 minute in the future.
                </p>
              </div>

              {/* Error banner */}
              {formError && (
                <div
                  style={{
                    padding: "0.65rem 0.9rem",
                    borderRadius: "0.4rem",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <AlertTriangle size={15} /> {formError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  scheduleMutation.isPending ||
                  !selectedClientId ||
                  !templateId ||
                  (sendType === "group" ? !groupId : !phone)
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  padding: "0.7rem 1.2rem",
                  background:
                    scheduleMutation.isPending ||
                    !selectedClientId ||
                    !templateId ||
                    (sendType === "group" ? !groupId : !phone)
                      ? "var(--secondary)"
                      : "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  cursor:
                    scheduleMutation.isPending ||
                    !selectedClientId ||
                    !templateId ||
                    (sendType === "group" ? !groupId : !phone)
                      ? "not-allowed"
                      : "pointer",
                  fontSize: "0.9rem",
                }}
              >
                {scheduleMutation.isPending ? (
                  <Loader2
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                ) : (
                  <Clock size={16} />
                )}
                Schedule Message
              </button>
            </div>
          </form>
        </div>

        {/* ── Scheduled List ─────────────────────────────────────────── */}
        <div className="stat-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>
              Scheduled Messages
            </h2>
            <button
              onClick={() => refetch()}
              disabled={loadingScheduled}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.35rem 0.75rem",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: "var(--secondary)",
              }}
            >
              <RefreshCw
                size={13}
                style={
                  loadingScheduled
                    ? { animation: "spin 1s linear infinite" }
                    : {}
                }
              />
              Refresh
            </button>
          </div>

          {loadingScheduled ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "var(--secondary)",
              }}
            >
              <Loader2
                size={24}
                style={{ animation: "spin 1s linear infinite" }}
              />
            </div>
          ) : scheduled.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: "var(--secondary)",
              }}
            >
              <Send
                size={36}
                style={{ opacity: 0.3, marginBottom: "0.75rem" }}
              />
              <p>No scheduled messages yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.875rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid var(--border)",
                      color: "var(--secondary)",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>
                      Template
                    </th>
                    <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>
                      Target
                    </th>
                    <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>
                      Scheduled At
                    </th>
                    <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>
                      Status
                    </th>
                    <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scheduled.map((row: ScheduledMessageDto) => (
                    <tr
                      key={row.id}
                      style={{ borderBottom: "1px solid var(--border)" }}
                    >
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        {row.templateName || "—"}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        {row.groupName ? (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Users size={13} />
                            {row.groupName}
                          </span>
                        ) : row.phoneNumber ? (
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Phone size={13} />
                            {row.phoneNumber}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td
                        style={{
                          padding: "0.6rem 0.75rem",
                          whiteSpace: "nowrap",
                          color: "var(--primary)",
                          fontWeight: 500,
                        }}
                      >
                        {formatLocal(row.scheduledAt)}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        <StatusBadge status={row.status} />
                        {row.errorMessage && (
                          <p
                            style={{
                              fontSize: "0.7rem",
                              color: "#b91c1c",
                              marginTop: "0.15rem",
                            }}
                            title={row.errorMessage}
                          >
                            {row.errorMessage.length > 40
                              ? row.errorMessage.slice(0, 40) + "…"
                              : row.errorMessage}
                          </p>
                        )}
                      </td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        {row.status === "Scheduled" && (
                          <button
                            onClick={() => cancelMutation.mutate(row.id)}
                            disabled={cancelMutation.isPending}
                            title="Cancel scheduled message"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.3rem 0.6rem",
                              border: "1px solid #fecaca",
                              borderRadius: "0.375rem",
                              background: "#fef2f2",
                              color: "#dc2626",
                              cursor: "pointer",
                              fontSize: "0.78rem",
                              fontWeight: 500,
                            }}
                          >
                            <Trash2 size={13} />
                            Cancel
                          </button>
                        )}
                        {row.status === "Completed" && (
                          <CheckCircle2 size={18} color="#16a34a" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
