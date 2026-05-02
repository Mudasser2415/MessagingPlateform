import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import {
  MessageSquare,
  Send,
  ArrowDownRight,
  TrendingUp,
  Building2,
} from "lucide-react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { MobileInput } from "../components/MobileInput";
import { CreditCard } from "../components/CreditCard";
import { RecentMessagesTable } from "../components/RecentMessagesTable";
import { mappingService } from "../services/mappingService";
import { employeeManagementService } from "../services/employeeManagementService";
import { getMobileValidationError } from "../utils/mobileValidation";

type ClientFormState = {
  name: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  partnerId: string;
};

type PartnerFormState = {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  companyName: string;
  location: string;
};

type FormNotice = {
  tone: "success" | "error";
  text: string;
};

const initialClientForm: ClientFormState = {
  name: "",
  mobileNumber: "",
  address: "",
  location: "",
  businessType: "",
  partnerId: "",
};

const initialPartnerForm: PartnerFormState = {
  name: "",
  mobileNumber: "",
  email: "",
  password: "",
  companyName: "",
  location: "",
};

const businessTypeOptions = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Education",
  "Logistics",
  "Hospitality",
  "Manufacturing",
  "Other",
];

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, selectedClientId, setSelectedClientId } = useAuthStore();
  const isEmployee = user?.role === "Employee";
  const canCreatePartners = Boolean(user?.canCreatePartners);

  const [clientForm, setClientForm] =
    useState<ClientFormState>(initialClientForm);
  const [partnerForm, setPartnerForm] =
    useState<PartnerFormState>(initialPartnerForm);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [partnerErrors, setPartnerErrors] = useState<Record<string, string>>(
    {},
  );
  const [clientNotice, setClientNotice] = useState<FormNotice | null>(null);
  const [partnerNotice, setPartnerNotice] = useState<FormNotice | null>(null);

  const { data: assignedClients = [] } = useQuery({
    queryKey: ["employee-assigned-clients", user?.id],
    queryFn: () => mappingService.getAssignedClientsForEmployee(user?.id || ""),
    enabled: isEmployee && Boolean(user?.id),
  });

  const { data: visibleClients = [] } = useQuery({
    queryKey: ["employee-visible-clients", user?.id],
    queryFn: () => employeeManagementService.getClients(),
    enabled: isEmployee && Boolean(user?.id),
  });

  const { data: availablePartners = [] } = useQuery({
    queryKey: ["employee-partners", user?.id],
    queryFn: () => employeeManagementService.getPartners(),
    enabled: isEmployee && Boolean(user?.id),
  });

  const createClientMutation = useMutation({
    mutationFn: employeeManagementService.createClient,
    onSuccess: async (clientId) => {
      setClientNotice({
        tone: "success",
        text: "Client created and assigned to your workspace.",
      });
      setClientForm(initialClientForm);
      setClientErrors({});
      setSelectedClientId(clientId);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["employee-assigned-clients", user?.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["employee-visible-clients", user?.id],
        }),
      ]);
    },
    onError: (error: any) => {
      setClientNotice({
        tone: "error",
        text: error?.response?.data?.message || "Unable to create client.",
      });
    },
  });

  const createPartnerMutation = useMutation({
    mutationFn: employeeManagementService.createPartner,
    onSuccess: async () => {
      setPartnerNotice({
        tone: "success",
        text: "Partner created successfully.",
      });
      setPartnerForm(initialPartnerForm);
      setPartnerErrors({});
      await queryClient.invalidateQueries({
        queryKey: ["employee-partners", user?.id],
      });
    },
    onError: (error: any) => {
      setPartnerNotice({
        tone: "error",
        text: error?.response?.data?.message || "Unable to create partner.",
      });
    },
  });

  const selectedClient = assignedClients.find(
    (client) => client.clientId === selectedClientId,
  );

  const validateClientForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!clientForm.name.trim()) {
      nextErrors.name = "Client name is required.";
    }

    const mobileError = getMobileValidationError(clientForm.mobileNumber, {
      required: true,
    });
    if (mobileError) {
      nextErrors.mobileNumber = mobileError;
    }

    if (!clientForm.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!clientForm.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!clientForm.businessType.trim()) {
      nextErrors.businessType = "Business type is required.";
    }

    setClientErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePartnerForm = () => {
    const nextErrors: Record<string, string> = {};

    if (!partnerForm.name.trim()) {
      nextErrors.name = "Partner contact name is required.";
    }

    const mobileError = getMobileValidationError(partnerForm.mobileNumber, {
      required: true,
      invalidMessage:
        "Enter a valid India mobile number such as 9876543210 or +919876543210.",
    });
    if (mobileError) {
      nextErrors.mobileNumber = mobileError;
    }

    if (
      partnerForm.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerForm.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!partnerForm.password.trim()) {
      nextErrors.password = "Password is required.";
    } else if (partnerForm.password.trim().length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }

    if (!partnerForm.companyName.trim()) {
      nextErrors.companyName = "Company name is required.";
    }

    if (!partnerForm.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    setPartnerErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleClientSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setClientNotice(null);

    if (!validateClientForm()) {
      return;
    }

    createClientMutation.mutate({
      name: clientForm.name.trim(),
      mobileNumber: clientForm.mobileNumber,
      address: clientForm.address.trim(),
      location: clientForm.location.trim(),
      businessType: clientForm.businessType.trim(),
      partnerId: clientForm.partnerId || null,
    });
  };

  const handlePartnerSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPartnerNotice(null);

    if (!validatePartnerForm()) {
      return;
    }

    createPartnerMutation.mutate({
      name: partnerForm.name.trim(),
      mobileNumber: partnerForm.mobileNumber,
      email: partnerForm.email.trim() || null,
      password: partnerForm.password.trim(),
      companyName: partnerForm.companyName.trim(),
      location: partnerForm.location.trim(),
    });
  };

  const renderNotice = (notice: FormNotice | null) => {
    if (!notice) {
      return null;
    }

    const isSuccess = notice.tone === "success";
    return (
      <div
        style={{
          padding: "0.8rem 0.95rem",
          borderRadius: "0.8rem",
          border: `1px solid ${isSuccess ? "rgba(34, 197, 94, 0.25)" : "rgba(239, 68, 68, 0.25)"}`,
          backgroundColor: isSuccess
            ? "rgba(34, 197, 94, 0.08)"
            : "rgba(239, 68, 68, 0.08)",
          color: isSuccess ? "#166534" : "#991b1b",
          fontSize: "0.85rem",
        }}
      >
        {notice.text}
      </div>
    );
  };

  const stats = [
    {
      label: "Total Messages",
      value: "25,431",
      icon: MessageSquare,
      color: "#6366f1",
    },
    { label: "Sent Messages", value: "24,102", icon: Send, color: "#10b981" },
    {
      label: "Failed Messages",
      value: "432",
      icon: ArrowDownRight,
      color: "#ef4444",
    },
    {
      label: "Pending Messages",
      value: "897",
      icon: TrendingUp,
      color: "#f59e0b",
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="welcome-section">
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "var(--foreground)",
          }}
        >
          Welcome, {user?.name || "User"}
        </h1>
        <p style={{ color: "var(--secondary)", marginTop: "0.25rem" }}>
          {user?.role === "Employee"
            ? "Work is scoped to the assigned client selected in the header."
            : "Here's your messaging overview for today."}
        </p>
      </div>

      {user?.role === "Employee" && (
        <div
          className="stat-card"
          style={{
            display: "grid",
            gridTemplateColumns: "1.3fr 0.7fr",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--primary)",
              }}
            >
              Client Context
            </p>
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                marginTop: "0.4rem",
              }}
            >
              {selectedClient?.clientName || "No client selected"}
            </h2>
            <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
              {selectedClient
                ? `${selectedClient.location} • ${selectedClient.businessType}`
                : "Select an assigned client to create templates, groups, and messages."}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "0.85rem",
            }}
          >
            <div
              style={{
                padding: "1rem",
                borderRadius: "0.85rem",
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              <Building2 size={16} color="#2563eb" />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--secondary)",
                  marginTop: "0.6rem",
                }}
              >
                Assigned Clients
              </p>
              <p style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                {visibleClients.length || assignedClients.length}
              </p>
            </div>
            <div
              style={{
                padding: "1rem",
                borderRadius: "0.85rem",
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              <MessageSquare size={16} color="#7c3aed" />
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--secondary)",
                  marginTop: "0.6rem",
                }}
              >
                Selected Client
              </p>
              <p style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                {selectedClient ? "Ready" : "Pending"}
              </p>
            </div>
          </div>
        </div>
      )}

      {isEmployee && (
        <div
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <section
            className="stat-card"
            style={{ display: "grid", gap: "1rem" }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--primary)",
                }}
              >
                Create Client
              </p>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  marginTop: "0.4rem",
                }}
              >
                Add a client to your portfolio
              </h3>
              <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                New clients are owned by you and automatically assigned to your
                workspace.
              </p>
            </div>

            {renderNotice(clientNotice)}

            <form
              onSubmit={handleClientSubmit}
              style={{ display: "grid", gap: "0.95rem" }}
            >
              <Input
                label="Client Name"
                value={clientForm.name}
                onChange={(event) =>
                  setClientForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                error={clientErrors.name}
                placeholder="Acme Retail"
              />

              <MobileInput
                label="Mobile Number"
                value={clientForm.mobileNumber}
                onChange={(value) =>
                  setClientForm((current) => ({
                    ...current,
                    mobileNumber: value,
                  }))
                }
                error={clientErrors.mobileNumber}
                showPrefix
                required
              />

              <Input
                label="Address"
                value={clientForm.address}
                onChange={(event) =>
                  setClientForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                error={clientErrors.address}
                placeholder="14 Market Road"
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.85rem",
                }}
              >
                <Input
                  label="Location"
                  value={clientForm.location}
                  onChange={(event) =>
                    setClientForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  error={clientErrors.location}
                  placeholder="Mumbai"
                />

                <div className="form-group">
                  <label className="form-label">Business Type</label>
                  <select
                    className={`form-input ${clientErrors.businessType ? "border-red-500" : ""}`}
                    value={clientForm.businessType}
                    onChange={(event) =>
                      setClientForm((current) => ({
                        ...current,
                        businessType: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select a business type</option>
                    {businessTypeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {clientErrors.businessType && (
                    <p className="mt-1 text-xs text-red-500">
                      {clientErrors.businessType}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Partner (optional)</label>
                <select
                  className="form-input"
                  value={clientForm.partnerId}
                  onChange={(event) =>
                    setClientForm((current) => ({
                      ...current,
                      partnerId: event.target.value,
                    }))
                  }
                >
                  <option value="">No partner linked</option>
                  {availablePartners.map((partner) => (
                    <option key={partner.partnerId} value={partner.partnerId}>
                      {partner.companyName}
                    </option>
                  ))}
                </select>
                <p
                  style={{
                    marginTop: "0.35rem",
                    fontSize: "0.75rem",
                    color: "var(--secondary)",
                  }}
                >
                  Only partners you created are available here.
                </p>
              </div>

              <Button type="submit" isLoading={createClientMutation.isPending}>
                Create Client
              </Button>
            </form>
          </section>

          <section
            className="stat-card"
            style={{ display: "grid", gap: "1rem" }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--primary)",
                }}
              >
                Partner Access
              </p>
              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  marginTop: "0.4rem",
                }}
              >
                {canCreatePartners
                  ? "Create partner accounts"
                  : "Partner creation disabled"}
              </h3>
              <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                {canCreatePartners
                  ? "Partners created here stay isolated to your account and are the only ones you can attach to new clients."
                  : "An admin must enable partner creation on your employee account before you can add partners."}
              </p>
            </div>

            {canCreatePartners ? (
              <>
                {renderNotice(partnerNotice)}

                <form
                  onSubmit={handlePartnerSubmit}
                  style={{ display: "grid", gap: "0.95rem" }}
                >
                  <Input
                    label="Partner Contact"
                    value={partnerForm.name}
                    onChange={(event) =>
                      setPartnerForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    error={partnerErrors.name}
                    placeholder="Priya Sharma"
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.85rem",
                    }}
                  >
                    <MobileInput
                      label="Mobile Number"
                      value={partnerForm.mobileNumber}
                      onChange={(value) =>
                        setPartnerForm((current) => ({
                          ...current,
                          mobileNumber: value,
                        }))
                      }
                      error={partnerErrors.mobileNumber}
                      showPrefix
                      required
                    />

                    <Input
                      label="Email"
                      value={partnerForm.email}
                      onChange={(event) =>
                        setPartnerForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      error={partnerErrors.email}
                      placeholder="partner@company.com"
                    />
                  </div>

                  <Input
                    label="Temporary Password"
                    type="password"
                    value={partnerForm.password}
                    onChange={(event) =>
                      setPartnerForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    error={partnerErrors.password}
                    placeholder="Minimum 8 characters"
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.85rem",
                    }}
                  >
                    <Input
                      label="Company Name"
                      value={partnerForm.companyName}
                      onChange={(event) =>
                        setPartnerForm((current) => ({
                          ...current,
                          companyName: event.target.value,
                        }))
                      }
                      error={partnerErrors.companyName}
                      placeholder="Northwind Distribution"
                    />

                    <Input
                      label="Location"
                      value={partnerForm.location}
                      onChange={(event) =>
                        setPartnerForm((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      error={partnerErrors.location}
                      placeholder="Bengaluru"
                    />
                  </div>

                  <Button
                    type="submit"
                    isLoading={createPartnerMutation.isPending}
                  >
                    Create Partner
                  </Button>
                </form>
              </>
            ) : (
              <div
                style={{
                  padding: "1rem",
                  borderRadius: "0.85rem",
                  border: "1px dashed rgba(148, 163, 184, 0.65)",
                  backgroundColor: "rgba(148, 163, 184, 0.08)",
                  color: "var(--secondary)",
                  fontSize: "0.9rem",
                }}
              >
                Your current access supports client creation only. Visible
                partners: {availablePartners.length}.
              </div>
            )}
          </section>
        </div>
      )}

      <div className="stat-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: `${stat.color}15`,
                  color: stat.color,
                }}
              >
                <stat.icon size={24} />
              </div>
            </div>
            <p
              style={{
                color: "var(--secondary)",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {stat.label}
            </p>
            <h3
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                marginTop: "0.25rem",
              }}
            >
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: "2.5rem",
          display: "grid",
          gridTemplateColumns: "3fr 1fr",
          gap: "2rem",
        }}
      >
        <RecentMessagesTable />
        <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
          <CreditCard
            clientId={user?.role === "Employee" ? selectedClientId : null}
            title="Delivery Credits"
            emptyMessage="Select an assigned client in the header to review available credits."
            actionPath="/credits"
          />

          <div className="stat-card" style={{ height: "fit-content" }}>
            <h4 style={{ fontWeight: 600, marginBottom: "1rem" }}>
              Recent Activity
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
                • Message sent to Group 'Sales'
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
                • Template 'Promo' updated
              </p>
              <p style={{ fontSize: "0.875rem", color: "var(--secondary)" }}>
                • New group 'Dev Team' created
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
