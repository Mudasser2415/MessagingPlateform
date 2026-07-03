import React from "react";
import { useMobileValidation } from "../hooks/useMobileValidation";

type MobileInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "onBlur"
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  showPrefix?: boolean;
  normalizeOnBlur?: boolean;
  helperText?: string;
  emptyMessage?: string;
  invalidMessage?: string;
  containerStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  errorStyle?: React.CSSProperties;
};

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  showPrefix = false,
  normalizeOnBlur = true,
  helperText,
  emptyMessage,
  invalidMessage,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  placeholder = "9876543210",
  disabled,
  ...inputProps
}) => {
  const validation = useMobileValidation(value, {
    required,
    normalizeOnBlur,
    onChange,
    onBlur,
    emptyMessage,
    invalidMessage,
  });

  const displayError = error || validation.error;

  return (
    <div className="form-group" style={containerStyle}>
      <label className="form-label" style={labelStyle}>
        {label}
        {required && (
          <span style={{ color: "#dc2626", marginLeft: "0.15rem" }}>*</span>
        )}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: showPrefix ? "0.65rem" : 0,
        }}
      >
        {/* {showPrefix && (
          <div
            aria-hidden="true"
            style={{
              minWidth: 56,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.75rem 0.9rem",
              borderRadius: "0.75rem",
              border: `1px solid ${displayError ? "#ef4444" : "var(--border, #d1d5db)"}`,
              backgroundColor: "rgba(15, 23, 42, 0.04)",
              color: "var(--secondary, #475569)",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            +91
          </div>
        )} */}
        <input
          {...inputProps}
          type="tel"
          inputMode="numeric"
          maxLength={10}
          className={`form-input ${displayError ? "border-red-500" : ""}`}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => validation.handleChange(event.target.value)}
          onBlur={validation.handleBlur}
          style={{
            marginBottom: 0,
            borderColor: displayError ? "#ef4444" : undefined,
            ...inputStyle,
          }}
        />
      </div>
      {displayError && (
        <p className="mt-1 text-xs text-red-500" style={errorStyle}>
          {displayError}
        </p>
      )}
      {!displayError && helperText && (
        <p
          style={{
            marginTop: "0.35rem",
            fontSize: "0.75rem",
            color: "var(--secondary)",
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
