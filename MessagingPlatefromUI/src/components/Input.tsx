import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  type,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPasswordField = type === "password";

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <input
          className={`form-input ${error ? "border-red-500" : ""}`}
          type={isPasswordField && isPasswordVisible ? "text" : type}
          style={isPasswordField ? { paddingRight: "2.75rem" } : undefined}
          {...props}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            title={isPasswordVisible ? "Hide password" : "Show password"}
            disabled={props.disabled}
            style={{
              position: "absolute",
              top: "50%",
              right: "0.75rem",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              padding: 0,
              border: 0,
              background: "transparent",
              color: "#6b7280",
              cursor: props.disabled ? "not-allowed" : "pointer",
            }}
          >
            {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
