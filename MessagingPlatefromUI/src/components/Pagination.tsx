import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalCount,
  onPageChange,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        paddingTop: "1rem",
      }}
    >
      <p style={{ fontSize: "0.82rem", color: "var(--secondary)" }}>
        Showing page {page} of {Math.max(totalPages, 1)} with {totalCount} total
        messages.
      </p>

      <div style={{ display: "flex", gap: "0.6rem" }}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          style={paginationButtonStyle(page <= 1)}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          style={paginationButtonStyle(page >= totalPages || totalPages === 0)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

const paginationButtonStyle = (disabled: boolean): React.CSSProperties => ({
  border: "1px solid var(--border)",
  backgroundColor: "var(--card)",
  color: "var(--foreground)",
  padding: "0.65rem 0.95rem",
  borderRadius: "0.75rem",
  fontWeight: 700,
  opacity: disabled ? 0.5 : 1,
});
