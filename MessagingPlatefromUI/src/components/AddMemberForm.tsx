import React from "react";
import { Phone, Plus, Users } from "lucide-react";
import { Button } from "./Button";
import { CSVUpload } from "./CSVUpload";
import { PreviewTable, type CSVPreviewRow } from "./PreviewTable";

interface AddMemberFormProps {
  disabled?: boolean;
  groupName?: string;
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
            display: "inline-flex",
            alignItems: "center",
            gap: "0.45rem",
            padding: "0.55rem 0.9rem",
            borderRadius: 999,
            backgroundColor: "rgba(37, 99, 235, 0.1)",
            color: "#2563eb",
            fontWeight: 700,
            fontSize: "0.82rem",
            alignSelf: "flex-start",
          }}
        >
          <Users size={14} /> Selected Group
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
              Add one member at a time using an India-format mobile number.
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
              value={manualPhone}
              onChange={(event) => onManualPhoneChange(event.target.value)}
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
