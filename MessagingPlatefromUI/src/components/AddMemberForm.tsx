import React from "react";
import { ChevronDown, Phone, Plus, Users } from "lucide-react";
import { Button } from "./Button";
import { CSVUpload } from "./CSVUpload";
import { PreviewTable, type CSVPreviewRow } from "./PreviewTable";
import { sanitizeMobileNumberInput } from "../utils/mobileValidation";

export interface GroupOption {
  groupId: string;
  groupName: string;
}

interface AddMemberFormProps {
  disabled?: boolean;
  groupName?: string;
  groups?: GroupOption[];
  selectedGroupId?: string;
  groupsLoading?: boolean;
  onGroupChange?: (groupId: string) => void;
  onCreateGroup?: () => void;
  manualPhone: string;
  manualPhoneError?: string;
  isAddingMember: boolean;
  isSubmittingCsv: boolean;
  csvFileName?: string;
  csvRows: CSVPreviewRow[];
  onManualPhoneChange: (value: string) => void;
  onAddMember: () => void;
  onCSVRowsParsed: (rows: CSVPreviewRow[], fileName: string) => void;
  onCSVError: (message: string) => void;
  onSubmitCSV: () => void;
  onClearCSV: () => void;
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({
  disabled = false,
  groupName,
  groups = [],
  selectedGroupId = "",
  groupsLoading = false,
  onGroupChange,
  onCreateGroup,
  manualPhone,
  manualPhoneError,
  isAddingMember,
  isSubmittingCsv,
  csvFileName,
  csvRows,
  onManualPhoneChange,
  onAddMember,
  onCSVRowsParsed,
  onCSVError,
  onSubmitCSV,
  onClearCSV,
}) => {
  return (
    <section className="stat-card" style={{ display: "grid", gap: "1.25rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
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
            Add Members
          </p>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              marginTop: "0.35rem",
            }}
          >
            Manual entry and CSV import
          </h2>
          <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
            {groupName
              ? `Add members directly into ${groupName}.`
              : "Select a group to start adding members."}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            alignSelf: "flex-start",
            minWidth: 220,
          }}
        >
          <label
            htmlFor="add-member-group-select"
            style={{
              fontSize: "0.76rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--secondary)",
            }}
          >
            <Users
              size={12}
              style={{
                display: "inline",
                marginRight: "0.3rem",
                verticalAlign: "middle",
              }}
            />
            Select Group
          </label>
          <div style={{ position: "relative" }}>
            <select
              id="add-member-group-select"
              value={selectedGroupId}
              onChange={(e) => onGroupChange?.(e.target.value)}
              disabled={groupsLoading || isAddingMember || isSubmittingCsv}
              className="form-input"
              style={{
                marginBottom: 0,
                paddingRight: "2.2rem",
                appearance: "none",
              }}
            >
              {groupsLoading ? (
                <option value="">Loading groups…</option>
              ) : groups.length === 0 ? (
                <option value="">No groups available</option>
              ) : (
                <>
                  <option value="" disabled>
                    Select a group…
                  </option>
                  {groups.map((g) => (
                    <option key={g.groupId} value={g.groupId}>
                      {g.groupName}
                    </option>
                  ))}
                </>
              )}
            </select>
            <ChevronDown
              size={15}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--secondary)",
              }}
            />
          </div>
          {onCreateGroup && (
            <button
              type="button"
              onClick={onCreateGroup}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#2563eb",
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                alignSelf: "flex-start",
              }}
            >
              <Plus size={13} /> New Group
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
          alignItems: "start",
        }}
      >
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            padding: "1rem",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
          }}
        >
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.94rem" }}>Manual Entry</p>
            <p style={{ color: "var(--secondary)", fontSize: "0.82rem" }}>
              Add one member at a time using a valid 10-digit mobile number.
            </p>
          </div>

          <div style={{ position: "relative" }}>
            <Phone
              size={16}
              style={{
                position: "absolute",
                left: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--secondary)",
              }}
            />
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={manualPhone}
              onChange={(event) =>
                onManualPhoneChange(
                  sanitizeMobileNumberInput(event.target.value),
                )
              }
              placeholder="9876543210"
              className="form-input"
              style={{ paddingLeft: "2.4rem", marginBottom: 0 }}
              disabled={disabled || isAddingMember}
            />
          </div>

          {manualPhoneError ? (
            <p style={{ fontSize: "0.8rem", color: "#b91c1c" }}>
              {manualPhoneError}
            </p>
          ) : null}

          <Button
            type="button"
            onClick={onAddMember}
            isLoading={isAddingMember}
            disabled={disabled || isAddingMember}
            style={{ width: "auto", paddingInline: "1rem" }}
          >
            <Plus size={16} /> Add Member
          </Button>
        </div>

        <CSVUpload
          disabled={disabled || isSubmittingCsv}
          fileName={csvFileName}
          onRowsParsed={onCSVRowsParsed}
          onError={onCSVError}
        />
      </div>

      <PreviewTable
        rows={csvRows}
        isSubmitting={isSubmittingCsv}
        onSubmit={onSubmitCSV}
        onClear={onClearCSV}
      />
    </section>
  );
};
