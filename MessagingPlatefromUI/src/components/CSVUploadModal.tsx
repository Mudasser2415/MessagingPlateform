import React, { useState, useRef } from "react";
import { Upload, X, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "./Button";
import type { CSVParseResult } from "../utils/csvParser";
import {
  parseCSV,
  validateCSVFile,
  downloadCSVTemplate,
} from "../utils/csvParser";

interface CSVUploadModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  onUpload: (phoneNumbers: string[]) => Promise<void>;
  isLoading?: boolean;
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
  zIndex: 1000,
};

const modal = {
  backgroundColor: "var(--card)",
  borderRadius: "0.75rem",
  border: "1px solid var(--border)",
  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
  maxWidth: 600,
  width: "90%",
  animation: "slideUp 0.3s ease-out",
};

const modalHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1.5rem 1.5rem 1rem",
  borderBottom: "1px solid var(--border)",
};

const closeBtn = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--secondary)",
  padding: "0.25rem",
  display: "flex",
  alignItems: "center",
  transition: "color 0.2s",
};

const iconWrap = (color: string) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  borderRadius: "0.5rem",
  backgroundColor: `${color}20`,
});

const dropZone = {
  border: "2px dashed var(--border)",
  borderRadius: "0.5rem",
  padding: "2rem",
  textAlign: "center" as const,
  cursor: "pointer",
  transition: "all 0.2s",
};

const dropZoneActive = {
  ...dropZone,
  borderColor: "#6366f1",
  backgroundColor: "#6366f120",
};

export const CSVUploadModal: React.FC<CSVUploadModalProps> = ({
  title,
  description,
  onClose,
  onUpload,
  isLoading = false,
}) => {
  const [csvResult, setCSVResult] = useState<CSVParseResult | null>(null);
  const [error, setError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    const validation = validateCSVFile(file);

    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    try {
      const result = await parseCSV(file);
      if (result.validCount === 0) {
        setError("No valid phone numbers found in the CSV file.");
        setCSVResult(null);
        return;
      }
      setCSVResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
      setCSVResult(null);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!csvResult || csvResult.validCount === 0) return;

    setUploading(true);
    try {
      await onUpload(csvResult.phoneNumbers);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to upload phone numbers",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setCSVResult(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* Header */}
        <div style={modalHeader}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div style={iconWrap("#6366f1")}>
              <Upload size={18} color="#6366f1" />
            </div>
            <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>{title}</h2>
          </div>
          <button onClick={onClose} style={closeBtn} disabled={uploading}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {description && (
            <p
              style={{
                color: "var(--secondary)",
                fontSize: "0.875rem",
                marginBottom: "1.5rem",
              }}
            >
              {description}
            </p>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                padding: "1rem",
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "0.5rem",
                marginBottom: "1.5rem",
                alignItems: "flex-start",
              }}
            >
              <AlertTriangle
                size={18}
                color="#dc2626"
                style={{ marginTop: "0.125rem", flexShrink: 0 }}
              />
              <div style={{ fontSize: "0.875rem", color: "#991b1b" }}>
                {error}
              </div>
            </div>
          )}

          {!csvResult ? (
            <>
              {/* Upload Drop Zone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div
                style={isDragActive ? dropZoneActive : dropZone}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  style={{
                    ...iconWrap("#6366f1"),
                    width: 48,
                    height: 48,
                    margin: "0 auto 0.75rem",
                  }}
                >
                  <Upload size={24} color="#6366f1" />
                </div>
                <p style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                  Drag and drop your CSV file here
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
                  or click to select a file (max 5MB)
                </p>
              </div>

              {/* Helper Text */}
              <div
                style={{
                  marginTop: "1.5rem",
                  padding: "1rem",
                  backgroundColor: "var(--background)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  fontSize: "0.875rem",
                  color: "var(--secondary)",
                }}
              >
                <p style={{ marginBottom: "0.5rem", fontWeight: 500 }}>
                  📋 Supported Format:
                </p>
                <ul style={{ marginLeft: "1.25rem", marginBottom: "0.75rem" }}>
                  <li>Single column with phone numbers</li>
                  <li>Multiple columns (we'll find phone numbers)</li>
                  <li>Phone numbers with or without formatting</li>
                </ul>
                <button
                  onClick={downloadCSVTemplate}
                  style={{
                    color: "#6366f1",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 500,
                  }}
                >
                  Download CSV template →
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Parse Results */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{
                    padding: "1rem",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #dcfce7",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <CheckCircle size={20} color="#16a34a" />
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#4b5563",
                        textTransform: "uppercase",
                      }}
                    >
                      Valid Numbers
                    </p>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: "#15803d",
                      }}
                    >
                      {csvResult.validCount}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    padding: "1rem",
                    backgroundColor:
                      csvResult.invalidCount > 0 ? "#fef2f2" : "#f5f5f5",
                    border:
                      csvResult.invalidCount > 0
                        ? "1px solid #fecaca"
                        : "1px solid #e5e5e5",
                    borderRadius: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  {csvResult.invalidCount > 0 && (
                    <AlertTriangle size={20} color="#dc2626" />
                  )}
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#4b5563",
                        textTransform: "uppercase",
                      }}
                    >
                      Invalid Numbers
                    </p>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "1.25rem",
                        color: csvResult.invalidCount > 0 ? "#991b1b" : "#666",
                      }}
                    >
                      {csvResult.invalidCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invalid Numbers List */}
              {csvResult.invalidCount > 0 &&
                csvResult.invalidPhoneNumbers.length > 0 && (
                  <div
                    style={{
                      padding: "1rem",
                      backgroundColor: "#faf5ff",
                      border: "1px solid #e9d5ff",
                      borderRadius: "0.5rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "#6b21a8",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Sample Invalid Entries:
                    </p>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "#9333ea",
                        maxHeight: 120,
                        overflowY: "auto",
                      }}
                    >
                      {csvResult.invalidPhoneNumbers.map((phone, i) => (
                        <div key={i} style={{ padding: "0.25rem 0" }}>
                          {phone}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Summary */}
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--background)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  fontSize: "0.875rem",
                  color: "var(--secondary)",
                }}
              >
                Ready to import <strong>{csvResult.validCount}</strong> phone
                number{csvResult.validCount !== 1 ? "s" : ""}
              </div>
            </>
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
          }}
        >
          {csvResult ? (
            <>
              <Button
                onClick={handleReset}
                variant="outline"
                style={{ width: "auto", paddingInline: "1.25rem" }}
                disabled={uploading}
              >
                Change File
              </Button>
              <Button
                onClick={handleUpload}
                style={{ width: "auto", paddingInline: "1.25rem" }}
                disabled={uploading || isLoading}
                isLoading={uploading || isLoading}
              >
                {uploading || isLoading ? "Importing..." : "Import Numbers"}
              </Button>
            </>
          ) : (
            <Button
              onClick={onClose}
              variant="outline"
              style={{ width: "auto", paddingInline: "1.25rem" }}
              disabled={uploading}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
