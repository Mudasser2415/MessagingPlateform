import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import type { EmployeeOption } from "../services/userService";

interface EmployeeMultiSelectProps {
  employees: EmployeeOption[];
  selectedId: string;
  onChange: (userId: string) => void;
  disabled?: boolean;
}

export const EmployeeMultiSelect: React.FC<EmployeeMultiSelectProps> = ({
  employees,
  selectedId,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedId) ?? null,
    [employees, selectedId],
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return employees;
    }

    return employees.filter((employee) =>
      [employee.name, employee.mobileNumber, employee.email]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [employees, search]);

  const toggleEmployee = (employeeId: string) => {
    if (selectedId === employeeId) {
      onChange("");
      return;
    }

    onChange(employeeId);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        Select Employee
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        style={{
          width: "100%",
          minHeight: "48px",
          padding: "0.7rem 0.9rem",
          borderRadius: "0.5rem",
          border: "1px solid var(--border)",
          backgroundColor: "var(--input)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          color: "var(--foreground)",
        }}
      >
        <span
          style={{
            color: selectedId ? "var(--foreground)" : "var(--secondary)",
          }}
        >
          {selectedEmployee
            ? selectedEmployee.name
            : "Search and select an employee"}
        </span>
        <ChevronDown size={16} />
      </button>

      {selectedEmployee && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginTop: "0.75rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.45rem 0.75rem",
              borderRadius: "999px",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              color: "var(--primary)",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}
          >
            {selectedEmployee.name}
            <button
              type="button"
              onClick={() => toggleEmployee(selectedEmployee.id)}
              aria-label={`Remove ${selectedEmployee.name}`}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--primary)",
                display: "inline-flex",
                padding: 0,
              }}
            >
              <X size={14} />
            </button>
          </span>
        </div>
      )}

      {isOpen && (
        <div
          style={{
            position: "absolute",
            insetInline: 0,
            top: "calc(100% + 0.5rem)",
            borderRadius: "0.85rem",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            boxShadow: "var(--shadow-lg)",
            zIndex: 30,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.85rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--secondary)",
                }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Search employee by name or mobile"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ marginBottom: 0, paddingLeft: "2.25rem" }}
              />
            </div>
          </div>

          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {filteredEmployees.length === 0 ? (
              <div
                style={{
                  padding: "1rem",
                  color: "var(--secondary)",
                  textAlign: "center",
                }}
              >
                No employees match your search.
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const isSelected = selectedId === employee.id;

                return (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => toggleEmployee(employee.id)}
                    style={{
                      width: "100%",
                      border: "none",
                      backgroundColor: isSelected
                        ? "rgba(99, 102, 241, 0.08)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                      padding: "0.85rem 1rem",
                      textAlign: "left",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{employee.name}</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {employee.mobileNumber}
                      </div>
                    </div>
                    {isSelected && <Check size={16} color="var(--primary)" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
