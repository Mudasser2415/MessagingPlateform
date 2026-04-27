import React from "react";
import { Trash2 } from "lucide-react";

interface RemoveButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}

export const RemoveButton: React.FC<RemoveButtonProps> = ({
  onClick,
  label = "Remove",
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.5rem 0.8rem",
        borderRadius: "999px",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        color: "#b91c1c",
        fontWeight: 700,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Trash2 size={14} />
      {label}
    </button>
  );
};
