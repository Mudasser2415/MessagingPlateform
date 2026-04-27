import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, Phone, Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { templateService } from "../services/templateService";
import { groupService } from "../services/groupService";
import { messageService } from "../services/messageService";
import { useAuthStore } from "../store/authStore";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { MobileInput } from "../components/MobileInput";
import { Textarea } from "../components/Textarea";
import { useToastStore } from "../store/toastStore";
import { getMobileValidationError } from "../utils/mobileValidation";

export const SendMessagePage: React.FC = () => {
  const { selectedClientId } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);

  // State
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [sendType, setSendType] = useState<"group" | "single">("single");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [singlePhoneNumber, setSinglePhoneNumber] = useState("");
  const [singlePhoneError, setSinglePhoneError] = useState<
    string | undefined
  >();
  const [messageContent, setMessageContent] = useState("");
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>(
    {},
  );
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Queries
  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["templates"],
    queryFn: templateService.getTemplates,
  });

  const { data: groups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ["groups"],
    queryFn: groupService.getGroups,
  });

  const visibleTemplates = templates.filter(
    (template: any) =>
      !selectedClientId || template.clientId === selectedClientId,
  );

  const visibleGroups = groups.filter(
    (group: any) => !selectedClientId || group.clientId === selectedClientId,
  );

  // Selected Data
  const selectedTemplate = visibleTemplates.find(
    (t: any) => t.templateId === selectedTemplateId,
  );

  const templateVariables = useMemo(() => {
    const matches = Array.from(
      messageContent.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g),
      (match) => match[1].trim(),
    );

    return Array.from(new Set(matches));
  }, [messageContent]);

  const resolvedMessageContent = useMemo(() => {
    return messageContent.replace(/\{\{\s*([^{}]+?)\s*\}\}/g, (_, token) => {
      const key = String(token).trim();
      return dynamicValues[key] ?? "";
    });
  }, [dynamicValues, messageContent]);

  useEffect(() => {
    setMessageContent(selectedTemplate?.templateContent || "");
  }, [selectedTemplateId, selectedTemplate?.templateContent]);

  useEffect(() => {
    setDynamicValues((current) => {
      const nextValues = templateVariables.reduce<Record<string, string>>(
        (accumulator, variable) => {
          accumulator[variable] = current[variable] || "";
          return accumulator;
        },
        {},
      );

      const hasSameKeys =
        Object.keys(current).length === Object.keys(nextValues).length &&
        Object.keys(nextValues).every(
          (key) => current[key] === nextValues[key],
        );

      return hasSameKeys ? current : nextValues;
    });
  }, [templateVariables]);

  // Mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClientId)
        throw new Error("Select a client before sending messages");
      if (!selectedTemplateId) throw new Error("Please select a template");
      if (!messageContent.trim())
        throw new Error("Please enter template content");
      if (
        templateVariables.some((variable) => !dynamicValues[variable]?.trim())
      )
        throw new Error("Please enter all dynamic text values");
      if (sendType === "group" && !selectedGroupId)
        throw new Error("Please select a group");

      const payload = {
        clientId: selectedClientId,
        templateId: selectedTemplateId,
        messageContent: resolvedMessageContent.trim(),
        groupId: sendType === "group" ? selectedGroupId : undefined,
        phoneNumber: sendType === "single" ? singlePhoneNumber : "",
      };

      // If group is selected, theoretically we want to fetch the group's members and send to each
      // Or we can just send the group ID and let backend determine. Since our backend only stores
      // one message per request and does not iterate, we will loop here for robust group sending.
      if (sendType === "group") {
        const members = await groupService.getGroupMembers(selectedGroupId);
        if (!members || members.length === 0)
          throw new Error("Selected group has no members.");

        await Promise.all(
          members.map((m) =>
            messageService.createMessage({
              ...payload,
              phoneNumber: m.phoneNumber,
            }),
          ),
        );
      } else {
        await messageService.createMessage(payload);
      }
    },
    onSuccess: () => {
      addToast("Message request submitted successfully.", "success");
      setSuccessMsg("Message(s) initiated successfully!");
      setErrorMsg("");
      setSinglePhoneNumber("");
      setSelectedGroupId("");
      setDynamicValues({});
      setMessageContent(selectedTemplate?.templateContent || "");
      setTimeout(() => setSuccessMsg(""), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Error occurred while sending.");
      setSuccessMsg("");
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (sendType === "single") {
      const nextPhoneError = getMobileValidationError(singlePhoneNumber, {
        required: true,
        emptyMessage: "Phone number is required.",
        invalidMessage:
          "Enter a valid India mobile number such as 9876543210 or +919876543210.",
      });

      setSinglePhoneError(nextPhoneError);
      if (nextPhoneError) {
        setErrorMsg("");
        return;
      }
    }

    sendMutation.mutate();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>Send Message</h1>
        <p style={{ color: "var(--secondary)" }}>
          Send a new WhatsApp message via templates to single or bulk contacts.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "2rem",
        }}
      >
        {/* FORM SECTION */}
        <div className="stat-card">
          <form onSubmit={handleSend}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* Template Selection */}
              <div>
                <label className="form-label">
                  Select Template <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="form-input"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  disabled={isLoadingTemplates}
                  required
                >
                  <option value="">-- Choose a template --</option>
                  {visibleTemplates.map((t: any) => (
                    <option key={t.templateId} value={t.templateId}>
                      {t.templateName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Textarea
                  label="Template Content"
                  placeholder="Template content will appear here"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  required
                />
              </div>

              {templateVariables.length > 0 && (
                <div className="animate-fade-in">
                  <label className="form-label">Dynamic TextBox</label>
                  <div
                    style={{
                      display: "grid",
                      gap: "0.9rem",
                    }}
                  >
                    {templateVariables.map((variable) => (
                      <Input
                        key={variable}
                        label={`{{${variable}}}`}
                        placeholder={`Enter value for {{${variable}}}`}
                        value={dynamicValues[variable] || ""}
                        onChange={(e) =>
                          setDynamicValues((current) => ({
                            ...current,
                            [variable]: e.target.value,
                          }))
                        }
                        required
                      />
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    {
                      'Example: for "Hi my name is {{0}} and my age is {{1}}", enter values like "Ahamed" and "30".'
                    }
                  </p>
                </div>
              )}

              {/* Send Type Toggle */}
              <div>
                <label
                  className="form-label"
                  style={{ marginBottom: "0.75rem" }}
                >
                  Send Options
                </label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      padding: "0.75rem 1rem",
                      border: `1px solid ${sendType === "single" ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "0.5rem",
                      backgroundColor:
                        sendType === "single"
                          ? "rgba(99, 102, 241, 0.05)"
                          : "transparent",
                      flex: 1,
                    }}
                  >
                    <input
                      type="radio"
                      name="sendType"
                      value="single"
                      checked={sendType === "single"}
                      onChange={() => setSendType("single")}
                      style={{ cursor: "pointer" }}
                    />
                    <Phone
                      size={16}
                      color={
                        sendType === "single"
                          ? "var(--primary)"
                          : "var(--secondary)"
                      }
                    />
                    <span
                      style={{
                        fontWeight: 500,
                        color:
                          sendType === "single" ? "var(--primary)" : "inherit",
                      }}
                    >
                      Single Number
                    </span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      padding: "0.75rem 1rem",
                      border: `1px solid ${sendType === "group" ? "var(--primary)" : "var(--border)"}`,
                      borderRadius: "0.5rem",
                      backgroundColor:
                        sendType === "group"
                          ? "rgba(99, 102, 241, 0.05)"
                          : "transparent",
                      flex: 1,
                    }}
                  >
                    <input
                      type="radio"
                      name="sendType"
                      value="group"
                      checked={sendType === "group"}
                      onChange={() => setSendType("group")}
                      style={{ cursor: "pointer" }}
                    />
                    <Users
                      size={16}
                      color={
                        sendType === "group"
                          ? "var(--primary)"
                          : "var(--secondary)"
                      }
                    />
                    <span
                      style={{
                        fontWeight: 500,
                        color:
                          sendType === "group" ? "var(--primary)" : "inherit",
                      }}
                    >
                      Group / Bulk
                    </span>
                  </label>
                </div>
              </div>

              {/* Target Input */}
              {sendType === "single" ? (
                <div className="animate-fade-in">
                  <MobileInput
                    label="Phone Number"
                    placeholder="9876543210 or +919876543210"
                    value={singlePhoneNumber}
                    onChange={(value) => {
                      setSinglePhoneNumber(value);
                      if (singlePhoneError) {
                        setSinglePhoneError(undefined);
                      }
                    }}
                    error={singlePhoneError}
                    showPrefix
                    required
                  />
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--secondary)",
                      marginTop: "0.25rem",
                    }}
                  >
                    Numbers are normalized to the 10-digit Indian mobile format
                    before send.
                  </p>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <label className="form-label">
                    Select Group <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    className="form-input"
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    disabled={isLoadingGroups}
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
              )}

              {/* Status messages */}
              {errorMsg && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <AlertTriangle size={16} /> {errorMsg}
                </div>
              )}
              {successMsg && (
                <div
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#16a34a",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  <CheckCircle2 size={16} /> {successMsg}
                </div>
              )}

              {/* Submit Button */}
              <div style={{ marginTop: "1rem" }}>
                <Button
                  type="submit"
                  isLoading={sendMutation.isPending}
                  disabled={
                    !selectedTemplateId ||
                    !messageContent.trim() ||
                    templateVariables.some(
                      (variable) => !dynamicValues[variable]?.trim(),
                    ) ||
                    (sendType === "single" && !singlePhoneNumber) ||
                    (sendType === "group" && !selectedGroupId)
                  }
                >
                  <Send size={18} /> Send Message
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* PREVIEW SECTION */}
        <div>
          <div
            className="stat-card"
            style={{ backgroundColor: "#f8fafc", height: "100%" }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "1rem",
                color: "var(--secondary)",
              }}
            >
              Live Preview
            </h3>

            <div
              style={{
                backgroundColor: "#e5ddd5",
                borderRadius: "0.75rem",
                padding: "1.5rem",
                minHeight: "300px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {selectedTemplate ? (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "1rem",
                    borderRadius: "0.5rem 0.5rem 0.5rem 0",
                    maxWidth: "90%",
                    alignSelf: "flex-start",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    fontSize: "0.9rem",
                    whiteSpace: "pre-wrap",
                    color: "#111b21",
                    lineHeight: 1.5,
                  }}
                >
                  {resolvedMessageContent}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    height: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#667781",
                    fontSize: "0.875rem",
                    textAlign: "center",
                  }}
                >
                  Select a template to preview its content here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
