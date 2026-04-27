import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  title?: string;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  disabled = false,
  title = "Mark as Known Contact",
  onChange,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={title}
      title={title}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 50,
        height: 28,
        borderRadius: 999,
        border: "none",
        backgroundColor: checked ? "#16a34a" : "#94a3b8",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "background-color 0.2s ease, opacity 0.2s ease",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 25 : 3,
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.18)",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
};
