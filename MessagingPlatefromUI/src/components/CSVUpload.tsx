import React, { useRef } from "react";
import Papa from "papaparse";
import { FileSpreadsheet, Upload } from "lucide-react";
import {
  compactMobileNumber,
  isValidIndianMobileNumber,
  normalizeIndianMobileNumber,
} from "../utils/mobileValidation";
import { Button } from "./Button";
import type { CSVPreviewRow } from "./PreviewTable";

interface CSVUploadProps {
  disabled?: boolean;
  fileName?: string;
  onRowsParsed: (rows: CSVPreviewRow[], fileName: string) => void;
  onError: (message: string) => void;
}

type CSVRecord = {
  phoneNumber?: string;
};

export const CSVUpload: React.FC<CSVUploadProps> = ({
  disabled = false,
  fileName,
  onRowsParsed,
  onError,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const parseFile = (file: File) => {
    Papa.parse<CSVRecord>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const fields = results.meta.fields ?? [];
        if (!fields.includes("phoneNumber")) {
          onError("CSV must include a phoneNumber column.");
          return;
        }

        const seen = new Set<string>();
        const rows = results.data.map((row, index) => {
          const rawPhoneNumber =
            typeof row.phoneNumber === "string" ? row.phoneNumber.trim() : "";
          const compactValue = compactMobileNumber(rawPhoneNumber);
          const normalizedPhoneNumber = rawPhoneNumber
            ? normalizeIndianMobileNumber(rawPhoneNumber)
            : "";

          if (!compactValue) {
            return createPreviewRow(
              index,
              rawPhoneNumber,
              normalizedPhoneNumber,
              "Invalid",
              "Missing phone number",
            );
          }

          if (!isValidIndianMobileNumber(rawPhoneNumber)) {
            return createPreviewRow(
              index,
              rawPhoneNumber,
              normalizedPhoneNumber,
              "Invalid",
              "Invalid India format",
            );
          }

          if (seen.has(normalizedPhoneNumber)) {
            return createPreviewRow(
              index,
              normalizedPhoneNumber,
              normalizedPhoneNumber,
              "Duplicate",
              "Duplicate in file",
            );
          }

          seen.add(normalizedPhoneNumber);

          return createPreviewRow(
            index,
            normalizedPhoneNumber,
            normalizedPhoneNumber,
            "Valid",
          );
        });

        onRowsParsed(rows, file.name);
      },
      error: (error: Error) => {
        onError(error.message || "Failed to parse CSV file.");
      },
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gap: "0.85rem",
        padding: "1rem",
        border: "1px dashed rgba(37, 99, 235, 0.35)",
        borderRadius: "1rem",
        background:
          "linear-gradient(135deg, rgba(219, 234, 254, 0.8), rgba(239, 246, 255, 0.5))",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "0.9rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(37, 99, 235, 0.12)",
            color: "#2563eb",
          }}
        >
          <FileSpreadsheet size={18} />
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "0.92rem" }}>CSV Upload</p>
          <p style={{ color: "var(--secondary)", fontSize: "0.82rem" }}>
            Expected format: phoneNumber
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
          {fileName || "No CSV selected yet"}
        </span>
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }

              parseFile(file);
              event.currentTarget.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            style={{ width: "auto", paddingInline: "1rem" }}
          >
            <Upload size={16} /> Upload CSV
          </Button>
        </>
      </div>
    </div>
  );
};

const createPreviewRow = (
  index: number,
  phoneNumber: string,
  normalizedPhoneNumber: string,
  status: CSVPreviewRow["status"],
  reason?: string,
): CSVPreviewRow => ({
  id: `${index}-${phoneNumber || normalizedPhoneNumber || "row"}`,
  phoneNumber,
  normalizedPhoneNumber,
  status,
  reason,
});
