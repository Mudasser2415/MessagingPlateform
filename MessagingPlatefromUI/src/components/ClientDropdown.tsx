import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import type { ClientOption } from "../services/clientService";

interface ClientDropdownProps {
  clients: ClientOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  label?: string;
  multiple?: boolean;
}

export const ClientDropdown: React.FC<ClientDropdownProps> = ({
  clients,
  value,
  onChange,
  disabled = false,
  label,
  multiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const resolvedLabel =
    label || (multiple ? "Select Clients" : "Select Client");

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectedClients = useMemo(
    () => clients.filter((client) => selectedValues.includes(client.id)),
    [clients, selectedValues],
  );

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return clients;
    }

    return clients.filter((client) =>
      [
        client.name,
        client.location,
        client.mobileNumber,
        client.address,
        client.businessType,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query)),
    );
  }, [clients, search]);

  const toggleClient = (clientId: string) => {
    if (multiple) {
      if (selectedValues.includes(clientId)) {
        onChange(selectedValues.filter((id) => id !== clientId));
        return;
      }

      onChange([...selectedValues, clientId]);
      return;
    }

    onChange(clientId);
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
        {resolvedLabel}
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
            minWidth: 0,
            overflowWrap: "anywhere",
            color: selectedValues.length
              ? "var(--foreground)"
              : "var(--secondary)",
          }}
        >
          {selectedValues.length
            ? multiple
              ? `${selectedValues.length} client${selectedValues.length === 1 ? "" : "s"} selected`
              : selectedClients[0]
                ? `${selectedClients[0].name} - ${selectedClients[0].location}`
                : "Select a client"
            : multiple
              ? "Search and select clients"
              : "Search and select a client"}
        </span>
        <ChevronDown size={16} />
      </button>

      {selectedClients.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginTop: "0.75rem",
          }}
        >
          {selectedClients.map((client) => (
            <span
              key={client.id}
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
              {client.name}
              {multiple && (
                <button
                  type="button"
                  onClick={() => toggleClient(client.id)}
                  aria-label={`Remove ${client.name}`}
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
              )}
            </span>
          ))}
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
                placeholder="Search clients by name, location, or mobile"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ marginBottom: 0, paddingLeft: "2.25rem" }}
              />
            </div>
          </div>

          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {filteredClients.length === 0 ? (
              <div
                style={{
                  padding: "1rem",
                  color: "var(--secondary)",
                  textAlign: "center",
                }}
              >
                No clients match your search.
              </div>
            ) : (
              filteredClients.map((client) => {
                const isSelected = selectedValues.includes(client.id);

                return (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => toggleClient(client.id)}
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
                      <div style={{ fontWeight: 700 }}>{client.name}</div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {client.location} · {client.mobileNumber}
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
