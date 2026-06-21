import React, { useDeferredValue, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Eye,
  Loader,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  adminClientService,
  adminPartnerService,
  type AdminClientDetail,
  type CreateAdminClientRequest,
  type UpdateAdminClientRequest,
} from "../services/adminService";
import { MobileInput } from "../components/MobileInput";
import {
  getMobileValidationError,
  normalizeIndianMobileNumber,
} from "../utils/mobileValidation";
import PinCodeAddressSection, {
  type AddressData,
} from "../components/PinCodeAddressSection";
import { usePinCodeLookup } from "../hooks/usePinCodeLookup";

type ClientFormState = {
  name: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  partnerId: string;
  // PIN code address fields
  pinCode: string;
  state: string;
  district: string;
  taluk: string;
  postOffice: string;
};

const initialFormState: ClientFormState = {
  name: "",
  mobileNumber: "",
  address: "",
  location: "",
  businessType: "",
  partnerId: "",
  pinCode: "",
  state: "",
  district: "",
  taluk: "",
  postOffice: "",
};

const businessTypes = [
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

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export const AdminClientManagementPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<ClientFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // PIN code lookup
  const {
    status: pinStatus,
    result: pinResult,
    onPinChange,
  } = usePinCodeLookup();

  // When lookup succeeds, auto-fill address fields
  useEffect(() => {
    if (pinStatus === "success" && pinResult) {
      setFormState((prev) => ({
        ...prev,
        state: pinResult.state,
        district: pinResult.district,
        taluk: pinResult.taluk,
        postOffice: pinResult.postOffices[0] ?? "",
        location: `${pinResult.district}, ${pinResult.state}`,
      }));
    }
  }, [pinStatus, pinResult]);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [searchInput, setSearchInput] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [showClientFormModal, setShowClientFormModal] = useState(false);

  const deferredSearch = useDeferredValue(searchInput.trim());

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["admin-clients", deferredSearch, businessTypeFilter],
    queryFn: () =>
      adminClientService.getAllClients(
        deferredSearch || undefined,
        businessTypeFilter || undefined,
      ),
  });

  const { data: partners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ["admin-partners", "dropdown"],
    queryFn: () => adminPartnerService.getAllPartners(),
  });

  const { data: selectedClientDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-client", selectedClientId],
    queryFn: () => adminClientService.getClientById(selectedClientId as string),
    enabled: Boolean(selectedClientId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateAdminClientRequest) =>
      adminClientService.createClient(payload),
    onSuccess: (createdClient) => {
      setFormMessage("Client created successfully.");
      setFormState(initialFormState);
      setFormErrors({});
      setFormMode("create");
      setEditingClientId(null);
      setShowClientFormModal(false);
      setSelectedClientId(createdClient.id);
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      queryClient.setQueryData(
        ["admin-client", createdClient.id],
        createdClient,
      );
    },
    onError: (error: any) => {
      setFormMessage(
        error?.response?.data?.message || "Unable to create client.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      clientId,
      payload,
    }: {
      clientId: string;
      payload: UpdateAdminClientRequest;
    }) => adminClientService.updateClient(clientId, payload),
    onSuccess: (updatedClient) => {
      setFormMessage("Client updated successfully.");
      setFormState(initialFormState);
      setFormErrors({});
      setFormMode("create");
      setEditingClientId(null);
      setShowClientFormModal(false);
      setSelectedClientId(updatedClient.id);
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      queryClient.setQueryData(
        ["admin-client", updatedClient.id],
        updatedClient,
      );
    },
    onError: (error: any) => {
      setFormMessage(
        error?.response?.data?.message || "Unable to update client.",
      );
    },
  });

  const filteredClients = clients.filter((client) => {
    if (partnerFilter === "all") {
      return true;
    }

    return client.partnerId === partnerFilter;
  });

  const selectedClient =
    selectedClientDetail ||
    filteredClients.find((client) => client.id === selectedClientId) ||
    clients.find((client) => client.id === selectedClientId) ||
    null;

  const assignedClients = clients.filter((client) => client.partnerId).length;
  const totalGroups = clients.reduce(
    (sum, client) => sum + client.groupCount,
    0,
  );
  const totalMessages = clients.reduce(
    (sum, client) => sum + client.messageCount,
    0,
  );

  const setFieldValue = (field: keyof ClientFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    setFormErrors((current) => {
      if (!current[field]) {
        return current;
      }

      return {
        ...current,
        [field]: "",
      };
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formState.name.trim()) {
      errors.name = "Name is required.";
    }

    const mobileNumberError = getMobileValidationError(formState.mobileNumber, {
      required: true,
    });
    if (mobileNumberError) {
      errors.mobileNumber = mobileNumberError;
    }

    if (!formState.address.trim()) {
      errors.address = "Address is required.";
    }

    if (!formState.location.trim()) {
      errors.location = "Location is required.";
    }

    if (!formState.businessType.trim()) {
      errors.businessType = "Business type is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormMode("create");
    setEditingClientId(null);
    setFormState(initialFormState);
    setFormErrors({});
    setFormMessage(null);
  };

  const startEditing = (client: AdminClientDetail) => {
    setSelectedClientId(client.id);
    setEditingClientId(client.id);
    setFormMode("edit");
    setShowClientFormModal(true);
    setFormMessage(null);
    setFormErrors({});
    setFormState({
      name: client.name,
      mobileNumber: client.mobileNumber,
      address: client.address,
      location: client.location,
      businessType: client.businessType,
      partnerId: client.partnerId || "",
      pinCode: "",
      state: "",
      district: "",
      taluk: "",
      postOffice: "",
    });
  };

  const handleViewDetails = (clientId: string) => {
    setShowClientDetails(true);
    setSelectedClientId(clientId);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormMessage(null);

    if (!validateForm()) {
      return;
    }

    const pinSuffix = [
      formState.postOffice,
      formState.taluk,
      formState.district,
      formState.state,
      formState.pinCode,
    ]
      .filter(Boolean)
      .join(", ");
    const fullAddress = pinSuffix
      ? `${formState.address.trim()}${formState.address.trim() ? ", " : ""}${pinSuffix}`
      : formState.address.trim();

    const payload = {
      partnerId: formState.partnerId || null,
      name: formState.name.trim(),
      mobileNumber: normalizeIndianMobileNumber(formState.mobileNumber),
      address: fullAddress,
      location: formState.location.trim(),
      businessType: formState.businessType.trim(),
    } satisfies CreateAdminClientRequest;

    if (formMode === "create") {
      createMutation.mutate(payload);
      return;
    }

    if (!editingClientId) {
      return;
    }

    updateMutation.mutate({
      clientId: editingClientId,
      payload,
    });
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          padding: "0.85rem 1rem",
          borderRadius: "0.8rem",
          background:
            "linear-gradient(135deg, rgba(16, 185, 129, 0.11), rgba(15, 23, 42, 0.03))",
          border: "1px solid rgba(16, 185, 129, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#059669",
              marginBottom: "0.2rem",
            }}
          >
            Client Management
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>
            Clients
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
            marginLeft: "auto",
          }}
        >
          {[
            {
              label: "Total Clients",
              value: clients.length,
              icon: Users,
              color: "#2563eb",
            },
            {
              label: "Assigned to Partners",
              value: assignedClients,
              icon: BadgeCheck,
              color: "#059669",
            },
            {
              label: "Groups Managed",
              value: totalGroups,
              icon: BriefcaseBusiness,
              color: "#7c3aed",
            },
            {
              label: "Messages Sent",
              value: totalMessages,
              icon: Sparkles,
              color: "#ea580c",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                title={`${card.label}: ${card.value}`}
                aria-label={`${card.label}: ${card.value}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.25rem 0.35rem",
                  borderRadius: "999px",
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "999px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: `${card.color}18`,
                  }}
                >
                  <Icon size={13} color={card.color} />
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 800,
                    minWidth: "1ch",
                  }}
                >
                  {card.value}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {showClientFormModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowClientFormModal(false);
            resetForm();
          }}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "96vw",
              maxWidth: "1280px",
              maxHeight: "88vh",
              overflowY: "auto",
            }}
          >
            <section
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "var(--shadow)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                    {formMode === "create" ? "Create Client" : "Edit Client"}
                  </h2>
                  <p
                    style={{ color: "var(--secondary)", marginTop: "0.35rem" }}
                  >
                    Capture the client profile and bind it to a partner record
                    in one workflow.
                  </p>
                </div>

                {formMode === "edit" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowClientFormModal(false);
                      resetForm();
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      backgroundColor: "transparent",
                      color: "var(--foreground)",
                      fontWeight: 600,
                    }}
                  >
                    <X size={16} />
                    Cancel edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setShowClientFormModal(false);
                      resetForm();
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--border)",
                      backgroundColor: "transparent",
                      color: "var(--foreground)",
                      fontWeight: 600,
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {formMessage && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.9rem 1rem",
                    borderRadius: "0.75rem",
                    backgroundColor: formMessage
                      .toLowerCase()
                      .includes("success")
                      ? "rgba(16, 185, 129, 0.1)"
                      : "rgba(239, 68, 68, 0.1)",
                    color: formMessage.toLowerCase().includes("success")
                      ? "#065f46"
                      : "#991b1b",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>{formMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "1rem 1.25rem",
                  }}
                >
                  {[
                    {
                      key: "name",
                      label: "Name",
                      placeholder: "Northwind Traders",
                      type: "text",
                    },
                    {
                      key: "location",
                      label: "Location",
                      placeholder: "Mumbai, Maharashtra",
                      type: "text",
                    },
                  ].map((field) => (
                    <div key={field.key}>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          marginBottom: "0.5rem",
                        }}
                      >
                        {field.label}
                        <span
                          style={{ color: "#dc2626", marginLeft: "0.15rem" }}
                        >
                          *
                        </span>
                      </label>
                      <input
                        type={field.type}
                        className="form-input"
                        placeholder={field.placeholder}
                        value={formState[field.key as keyof ClientFormState]}
                        onChange={(event) =>
                          setFieldValue(
                            field.key as keyof ClientFormState,
                            event.target.value,
                          )
                        }
                        style={{
                          marginBottom: 0,
                          borderColor: formErrors[field.key]
                            ? "#ef4444"
                            : undefined,
                        }}
                      />
                      {formErrors[field.key] && (
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "#dc2626",
                            marginTop: "0.35rem",
                          }}
                        >
                          {formErrors[field.key]}
                        </p>
                      )}
                    </div>
                  ))}

                  <MobileInput
                    label="Mobile Number"
                    value={formState.mobileNumber}
                    onChange={(value) => setFieldValue("mobileNumber", value)}
                    error={formErrors.mobileNumber}
                    placeholder="9876543210 or +919876543210"
                    required
                    showPrefix
                  />

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Business Type
                      <span style={{ color: "#dc2626", marginLeft: "0.15rem" }}>
                        *
                      </span>
                    </label>
                    <select
                      className="form-input"
                      value={formState.businessType}
                      onChange={(event) =>
                        setFieldValue("businessType", event.target.value)
                      }
                      style={{
                        marginBottom: 0,
                        borderColor: formErrors.businessType
                          ? "#ef4444"
                          : undefined,
                      }}
                    >
                      <option value="">Select a business type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {formErrors.businessType && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#dc2626",
                          marginTop: "0.35rem",
                        }}
                      >
                        {formErrors.businessType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Partner
                    </label>
                    <select
                      className="form-input"
                      value={formState.partnerId}
                      onChange={(event) =>
                        setFieldValue("partnerId", event.target.value)
                      }
                      style={{
                        marginBottom: 0,
                        borderColor: formErrors.partnerId
                          ? "#ef4444"
                          : undefined,
                      }}
                      disabled={partnersLoading}
                    >
                      <option value="">
                        {partnersLoading
                          ? "Loading partners..."
                          : "No partner selected"}
                      </option>
                      {partners.map((partner) => (
                        <option
                          key={partner.partnerId}
                          value={partner.partnerId}
                        >
                          {partner.companyName} - {partner.name}
                        </option>
                      ))}
                    </select>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--secondary)",
                        marginTop: "0.35rem",
                      }}
                    >
                      Leave this blank to create an unassigned client.
                    </p>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Street / Building Address
                      <span style={{ color: "#dc2626", marginLeft: "0.15rem" }}>
                        *
                      </span>
                    </label>
                    <textarea
                      className="form-input"
                      placeholder="Enter street / building address (area details auto-fill below via PIN)"
                      value={formState.address}
                      onChange={(event) =>
                        setFieldValue("address", event.target.value)
                      }
                      rows={2}
                      style={{
                        marginBottom: 0,
                        resize: "vertical",
                        borderColor: formErrors.address ? "#ef4444" : undefined,
                      }}
                    />
                    {formErrors.address && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#dc2626",
                          marginTop: "0.35rem",
                        }}
                      >
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* ── PIN Code Address Auto-fill ────────────────────────────── */}
                  <div style={{ gridColumn: "1 / -1" }}>
                    <PinCodeAddressSection
                      value={{
                        pinCode: formState.pinCode,
                        state: formState.state,
                        district: formState.district,
                        taluk: formState.taluk,
                        postOffice: formState.postOffice,
                      }}
                      onChange={(data: AddressData) =>
                        setFormState((prev) => ({ ...prev, ...data }))
                      }
                      lookupStatus={pinStatus}
                      lookupResult={pinResult}
                      onPinChange={(pin) => {
                        setFieldValue("pinCode", pin);
                        onPinChange(pin);
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    marginTop: "1.5rem",
                    paddingTop: "1.25rem",
                    borderTop: "1px solid var(--border)",
                    flexWrap: "wrap",
                  }}
                >
                  <p style={{ fontSize: "0.8rem", color: "var(--secondary)" }}>
                    Client access credentials are provisioned automatically
                    during admin creation.
                  </p>

                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      padding: "0.9rem 1.2rem",
                      borderRadius: "999px",
                      border: "none",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : formMode === "create" ? (
                      <Plus size={16} />
                    ) : (
                      <Pencil size={16} />
                    )}
                    {formMode === "create" ? "Create Client" : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}

      <section
        style={{
          order: 1,
          display: "block",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow: "var(--shadow)",
          }}
        >
          <div
            style={{
              padding: "1.25rem 1.5rem",
              borderBottom: "1px solid var(--border)",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                  Client Directory
                </h2>
                <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                  Search clients, narrow by partner or business type, then open
                  the full detail view.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  flexWrap: "nowrap",
                }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowClientDetails(false);
                    resetForm();
                    setShowClientFormModal(true);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    width: "auto",
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                    padding: "0.45rem 0.8rem",
                    borderRadius: "999px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  <Plus size={14} />
                  Create Client
                </button>
                <div
                  style={{
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                    padding: "0.45rem 0.8rem",
                    borderRadius: "999px",
                    backgroundColor: "rgba(99, 102, 241, 0.08)",
                    color: "var(--primary)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                  }}
                >
                  {filteredClients.length} showing
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "0.85rem",
              }}
            >
              <div style={{ position: "relative", minWidth: 0 }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "0.9rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--secondary)",
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by client, location, phone, or partner"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  style={{ marginBottom: 0, paddingLeft: "2.5rem" }}
                />
              </div>

              <select
                className="form-input"
                value={businessTypeFilter}
                onChange={(event) => setBusinessTypeFilter(event.target.value)}
                style={{ marginBottom: 0 }}
              >
                <option value="">All business types</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                className="form-input"
                value={partnerFilter}
                onChange={(event) => setPartnerFilter(event.target.value)}
                style={{ marginBottom: 0 }}
              >
                <option value="all">All partners</option>
                {partners.map((partner) => (
                  <option key={partner.partnerId} value={partner.partnerId}>
                    {partner.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {clientsLoading ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: "var(--secondary)",
              }}
            >
              Loading clients...
            </div>
          ) : filteredClients.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <Users
                size={42}
                style={{ opacity: 0.45, marginBottom: "1rem" }}
              />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                No clients found
              </h3>
              <p style={{ color: "var(--secondary)", marginTop: "0.5rem" }}>
                Try broadening your filters or create the first client record.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Client</th>
                    <th>Partner</th>
                    <th>Mobile</th>
                    <th>Location</th>
                    <th>Business</th>
                    <th>Groups</th>
                    <th>Messages</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => {
                    const isSelected = selectedClient?.id === client.id;

                    return (
                      <tr
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSelected
                            ? "rgba(99, 102, 241, 0.06)"
                            : undefined,
                        }}
                      >
                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              title="View details"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleViewDetails(client.id);
                              }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              title="Edit client"
                              onClick={(event) => {
                                event.stopPropagation();
                                startEditing(client);
                              }}
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>{client.name}</td>
                        <td>
                          {client.partnerCompanyName || (
                            <span style={{ color: "var(--secondary)" }}>
                              None
                            </span>
                          )}
                        </td>
                        <td>{client.mobileNumber}</td>
                        <td>{client.location}</td>
                        <td>{client.businessType}</td>
                        <td>{client.groupCount}</td>
                        <td>{client.messageCount}</td>
                        <td>
                          <span
                            style={{
                              padding: "0.25rem 0.55rem",
                              borderRadius: "999px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              backgroundColor: client.partnerId
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(234, 88, 12, 0.12)",
                              color: client.partnerId ? "#047857" : "#c2410c",
                            }}
                          >
                            {client.partnerId ? "Assigned" : "Unassigned"}
                          </span>
                        </td>
                        <td>{formatDate(client.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {showClientDetails && (
        <div
          className="modal-overlay"
          onClick={() => setShowClientDetails(false)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "96vw",
              maxWidth: "1200px",
              maxHeight: "88vh",
              overflowY: "auto",
            }}
          >
            <div className="modal-header">
              <h2>Client Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowClientDetails(false)}
              >
                <X size={20} />
              </button>
            </div>

            {detailLoading ? (
              <div
                style={{
                  padding: "2rem 0",
                  textAlign: "center",
                  color: "var(--secondary)",
                }}
              >
                Loading client details...
              </div>
            ) : !selectedClient ? (
              <div style={{ padding: "2rem 0", textAlign: "center" }}>
                <Users
                  size={40}
                  style={{ opacity: 0.45, marginBottom: "1rem" }}
                />
                <h3 style={{ fontSize: "1rem", fontWeight: 800 }}>
                  Select a client
                </h3>
                <p style={{ color: "var(--secondary)", marginTop: "0.5rem" }}>
                  Pick any client from the directory to inspect its current
                  details.
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    padding: "1.2rem",
                    borderRadius: "0.9rem",
                    background:
                      "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(59, 130, 246, 0.04))",
                    border: "1px solid rgba(99, 102, 241, 0.12)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "var(--primary)",
                        }}
                      >
                        Active Record
                      </p>
                      <h3
                        style={{
                          fontSize: "1.35rem",
                          fontWeight: 800,
                          marginTop: "0.35rem",
                        }}
                      >
                        {selectedClient.name}
                      </h3>
                      <p
                        style={{
                          color: "var(--secondary)",
                          marginTop: "0.35rem",
                        }}
                      >
                        {selectedClient.businessType}
                      </p>
                    </div>

                    <span
                      style={{
                        padding: "0.35rem 0.7rem",
                        borderRadius: "999px",
                        backgroundColor: selectedClient.partnerId
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(234, 88, 12, 0.12)",
                        color: selectedClient.partnerId ? "#047857" : "#c2410c",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      {selectedClient.partnerId
                        ? "Partner linked"
                        : "Partner missing"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                    gap: "0.85rem",
                    marginTop: "1rem",
                  }}
                >
                  {[
                    {
                      label: "Groups",
                      value: selectedClient.groupCount,
                      icon: BriefcaseBusiness,
                      color: "#7c3aed",
                    },
                    {
                      label: "Messages",
                      value: selectedClient.messageCount,
                      icon: Sparkles,
                      color: "#ea580c",
                    },
                    {
                      label: "Partner",
                      value: selectedClient.partnerCompanyName
                        ? "Linked"
                        : "None",
                      icon: CheckCircle2,
                      color: "#059669",
                    },
                  ].map((metric) => {
                    const Icon = metric.icon;

                    return (
                      <div
                        key={metric.label}
                        style={{
                          padding: "0.95rem",
                          borderRadius: "0.85rem",
                          border: "1px solid var(--border)",
                          backgroundColor: "var(--background)",
                        }}
                      >
                        <Icon size={16} color={metric.color} />
                        <p
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--secondary)",
                            marginTop: "0.6rem",
                          }}
                        >
                          {metric.label}
                        </p>
                        <p style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                          {metric.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "0.85rem",
                    paddingTop: "1rem",
                  }}
                >
                  {[
                    {
                      label: "Mobile Number",
                      value: selectedClient.mobileNumber,
                      icon: Phone,
                    },
                    {
                      label: "Location",
                      value: selectedClient.location,
                      icon: MapPin,
                    },
                    {
                      label: "Address",
                      value: selectedClient.address,
                      icon: Building2,
                    },
                    {
                      label: "Assigned Partner",
                      value: selectedClient.partnerCompanyName
                        ? `${selectedClient.partnerCompanyName} (${selectedClient.partnerName || "Partner user"})`
                        : "No partner assigned",
                      icon: BadgeCheck,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.85rem",
                          padding: "0.95rem",
                          borderRadius: "0.85rem",
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(99, 102, 241, 0.1)",
                            color: "var(--primary)",
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--secondary)",
                            }}
                          >
                            {item.label}
                          </p>
                          <p style={{ fontWeight: 700, marginTop: "0.2rem" }}>
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  style={{
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{ fontSize: "0.75rem", color: "var(--secondary)" }}
                    >
                      Created On
                    </p>
                    <p style={{ fontWeight: 700, marginTop: "0.2rem" }}>
                      {formatDate(selectedClient.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowClientDetails(false);
                      startEditing(selectedClient);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1rem",
                      borderRadius: "999px",
                      border: "none",
                      backgroundColor: "var(--primary)",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    <Pencil size={15} /> Edit Client
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
