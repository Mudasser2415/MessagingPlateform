import React from "react";
import { Download } from "lucide-react";

interface ExportButtonProps {
  isLoading?: boolean;
  onClick: () => void;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  isLoading,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="report-secondary-button"
      style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem" }}
    >
      <Download size={16} />
      {isLoading ? "Exporting..." : "Export CSV"}
    </button>
  );
};
