import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminClientService } from "../services/adminService";
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketDto,
  TicketPriority,
  TicketType,
  TicketStatus,
} from "../services/ticketService";
import {
  getMobileValidationError,
  sanitizeMobileNumberInput,
} from "../utils/mobileValidation";

interface TicketFormProps {
  /** When provided the form is in "edit" mode */
  ticket?: TicketDto | null;
  onSubmit: (
    data: CreateTicketRequest | UpdateTicketRequest,
    mode: "create" | "edit",
  ) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];
const TICKET_TYPES: TicketType[] = ["INC", "SR"];
const STATUSES: TicketStatus[] = [
  "Open",
  "InProgress",
  "Resolved",
  "Closed",
  "Rejected",
];

export const TicketForm: React.FC<TicketFormProps> = ({
  ticket,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const isEdit = !!ticket;

  // Create-mode state
  const [clientId, setClientId] = useState(ticket?.clientId ?? "");
  const [mobileNumber, setMobileNumber] = useState(ticket?.mobileNumber ?? "");
  const [issueDescription, setIssueDescription] = useState(
    ticket?.issueDescription ?? "",
  );
  const [priority, setPriority] = useState<TicketPriority>(
    ticket?.priority ?? "Medium",
  );
  const [ticketType, setTicketType] = useState<TicketType>(
    ticket?.ticketType ?? "INC",
  );

  // Edit-mode state
  const [status, setStatus] = useState<TicketStatus>(ticket?.status ?? "Open");
  const [resolution, setResolution] = useState(
    ticket?.resolutionDescription ?? "",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load clients for dropdown
  const { data: clients = [] } = useQuery({
    queryKey: ["admin-clients-for-ticket-form"],
    queryFn: () => adminClientService.getAllClients(),
  });

  useEffect(() => {
    if (ticket) {
      setClientId(ticket.clientId);
      setMobileNumber(ticket.mobileNumber);
      setIssueDescription(ticket.issueDescription);
      setPriority(ticket.priority);
      setTicketType(ticket.ticketType);
      setStatus(ticket.status);
      setResolution(ticket.resolutionDescription ?? "");
    }
  }, [ticket]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!isEdit) {
      if (!clientId) e.clientId = "Client is required.";

      const mobileErr = getMobileValidationError(mobileNumber, {
        required: true,
      });
      if (mobileErr) e.mobileNumber = mobileErr;

      if (!issueDescription.trim())
        e.issueDescription = "Issue description is required.";
      else if (issueDescription.trim().length < 10)
        e.issueDescription = "Minimum 10 characters.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      const body: UpdateTicketRequest = {
        status,
        resolutionDescription: resolution.trim() || undefined,
      };
      onSubmit(body, "edit");
    } else {
      const body: CreateTicketRequest = {
        clientId,
        mobileNumber: mobileNumber.trim(),
        issueDescription: issueDescription.trim(),
        priority,
        ticketType,
      };
      onSubmit(body, "create");
    }
  };

  const field = (
    label: string,
    error?: string,
    children: React.ReactNode = null,
  ) => (
    <div className="tk-field-group" key={label}>
      <label className="tk-field-label">{label}</label>
      {children}
      {error && <span className="tk-field-error">{error}</span>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="tk-form">
      {!isEdit && (
        <>
          {field(
            "Client *",
            errors.clientId,
            <select
              className={`form-input${errors.clientId ? " form-input--error" : ""}`}
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>,
          )}

          {field(
            "Mobile Number *",
            errors.mobileNumber,
            <input
              type="tel"
              inputMode="numeric"
              className={`form-input${errors.mobileNumber ? " form-input--error" : ""}`}
              placeholder="9876543210"
              value={mobileNumber}
              maxLength={10}
              onChange={(e) =>
                setMobileNumber(sanitizeMobileNumberInput(e.target.value))
              }
            />,
          )}

          {field(
            "Issue Description *",
            errors.issueDescription,
            <textarea
              rows={4}
              className={`form-input tk-textarea${errors.issueDescription ? " form-input--error" : ""}`}
              placeholder="Describe the issue in detail…"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
            />,
          )}

          <div className="tk-form-row">
            {field(
              "Priority",
              undefined,
              <select
                className="form-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>,
            )}

            {field(
              "Ticket Type",
              undefined,
              <select
                className="form-input"
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value as TicketType)}
              >
                {TICKET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t === "INC" ? "INC — Incident" : "SR — Service Request"}
                  </option>
                ))}
              </select>,
            )}
          </div>
        </>
      )}

      {isEdit && (
        <>
          {field(
            "Status",
            undefined,
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>,
          )}

          {field(
            "Resolution Description",
            undefined,
            <textarea
              rows={4}
              className="form-input tk-textarea"
              placeholder="Describe the resolution steps taken…"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />,
          )}
        </>
      )}

      <div className="tk-form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save Changes"
              : "Create Ticket"}
        </button>
      </div>
    </form>
  );
};

export default TicketForm;
