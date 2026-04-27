import React from "react";
import { LoaderCircle } from "lucide-react";

interface LoaderProps {
  label?: string;
}

export const Loader: React.FC<LoaderProps> = ({ label = "Loading..." }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "2rem",
        color: "var(--secondary)",
      }}
    >
      <LoaderCircle
        size={18}
        style={{ animation: "spin 1s linear infinite" }}
      />
      <span>{label}</span>
    </div>
  );
};
