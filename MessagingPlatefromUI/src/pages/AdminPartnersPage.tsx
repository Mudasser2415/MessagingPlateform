import React, { useDeferredValue, useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Eye,
  Loader,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Power,
  Search,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminPartnerService,
  type AdminPartner,
  type CreatePartnerRequest,
  type UpdatePartnerRequest,
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

type StatusFilter = "all" | "active" | "disabled";

type PartnerFormState = {
  name: string;
  mobileNumber: string;
  email: string;
  password: string;
  companyName: string;
  location: string;
  // PIN address fields
  pinCode: string;
  state: string;
  district: string;
  taluk: string;
  postOffice: string;
};

const initialFormState: PartnerFormState = {
  name: "",
  mobileNumber: "",
  email: "",
  password: "",
  companyName: "",
  location: "",
  pinCode: "",
  state: "",
  district: "",
  taluk: "",
  postOffice: "",
};

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

export const AdminPartnersPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [formState, setFormState] =
    useState<PartnerFormState>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // PIN code lookup
  const {
    status: pinStatus,
    result: pinResult,
    onPinChange,
  } = usePinCodeLookup();

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
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showPartnerDetails, setShowPartnerDetails] = useState(false);
  const [showPartnerFormModal, setShowPartnerFormModal] = useState(false);

  const deferredSearch = useDeferredValue(searchInput.trim());

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["admin-partners", deferredSearch],
    queryFn: () => adminPartnerService.getAllPartners(deferredSearch),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreatePartnerRequest) =>
      adminPartnerService.createPartner(payload),
    onSuccess: (createdPartner) => {
      setFormMessage("Partner created successfully.");
      setFormState(initialFormState);
      setFormErrors({});
      setSelectedPartnerId(createdPartner.partnerId);
      setShowPartnerFormModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    },
    onError: (error: any) => {
      setFormMessage(
        error?.response?.data?.message || "Unable to create partner.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      partnerId,
      payload,
    }: {
      partnerId: string;
      payload: UpdatePartnerRequest;
    }) => adminPartnerService.updatePartner(partnerId, payload),
    onSuccess: (updatedPartner) => {
      setFormMessage("Partner updated successfully.");
      setSelectedPartnerId(updatedPartner.partnerId);
      setEditingPartnerId(null);
      setFormMode("create");
      setFormState(initialFormState);
      setFormErrors({});
      setShowPartnerFormModal(false);
      queryClient.invalidateQueries({ queryKey: ["admin-partners"] });
    },
    onError: (error: any) => {
      setFormMessage(
        error?.response?.data?.message || "Unable to update partner.",
      );
    },
  });

  const filteredPartners = partners.filter((partner) => {
    const statusMatches =
      statusFilter === "all" ||
      (statusFilter === "active" ? partner.isActive : !partner.isActive);

    const locationMatches =
      locationFilter === "all" || partner.companyAddress === locationFilter;

    return statusMatches && locationMatches;
  });

  const selectedPartner =
    filteredPartners.find(
      (partner) => partner.partnerId === selectedPartnerId,
    ) ||
    partners.find((partner) => partner.partnerId === selectedPartnerId) ||
    null;

  const uniqueLocations = Array.from(
    new Set(
      partners
        .map((partner) => partner.companyAddress)
        .filter((location) => location.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const activePartners = partners.filter((partner) => partner.isActive).length;
  const disabledPartners = partners.length - activePartners;
  const totalClients = partners.reduce(
    (sum, partner) => sum + partner.clientCount,
    0,
  );

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

    if (
      formState.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email.trim())
    ) {
      errors.email = "Enter a valid email address.";
    }

    if (formMode === "create") {
      if (!formState.password.trim()) {
        errors.password = "Password is required.";
      } else if (formState.password.trim().length < 8) {
        errors.password = "Password must be at least 8 characters.";
      }
    }

    if (!formState.companyName.trim()) {
      errors.companyName = "Company name is required.";
    }

    if (!formState.location.trim()) {
      errors.location = "Location is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormMode("create");
    setEditingPartnerId(null);
    setFormState(initialFormState);
    setFormErrors({});
    setFormMessage(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormMessage(null);

    if (!validateForm()) {
      return;
    }

    if (formMode === "create") {
      createMutation.mutate({
        name: formState.name.trim(),
        mobileNumber: normalizeIndianMobileNumber(formState.mobileNumber),
        email: formState.email.trim() || null,
        password: formState.password.trim(),
        companyName: formState.companyName.trim(),
        companyAddress: formState.location.trim(),
      });

      return;
    }

    if (!editingPartnerId) {
      return;
    }

    updateMutation.mutate({
      partnerId: editingPartnerId,
      payload: {
        name: formState.name.trim(),
        mobileNumber: normalizeIndianMobileNumber(formState.mobileNumber),
        email: formState.email.trim() || null,
        companyName: formState.companyName.trim(),
        companyAddress: formState.location.trim(),
        isActive:
          partners.find((partner) => partner.partnerId === editingPartnerId)
            ?.isActive ?? true,
      },
    });
  };

  const startEditing = (partner: AdminPartner) => {
    setSelectedPartnerId(partner.partnerId);
    setEditingPartnerId(partner.partnerId);
    setFormMode("edit");
    setShowPartnerFormModal(true);
    setFormMessage(null);
    setFormErrors({});
    setFormState({
      name: partner.name,
      mobileNumber: partner.mobileNumber,
      email: partner.email,
      password: "",
      companyName: partner.companyName,
      location: partner.companyAddress,
      pinCode: "",
      state: "",
      district: "",
      taluk: "",
      postOffice: "",
    });
  };

  const handleViewDetails = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setShowPartnerDetails(true);
  };

  const togglePartnerStatus = (partner: AdminPartner) => {
    updateMutation.mutate({
      partnerId: partner.partnerId,
      payload: {
        name: partner.name,
        mobileNumber: partner.mobileNumber,
        email: partner.email || null,
        companyName: partner.companyName,
        companyAddress: partner.companyAddress,
        isActive: !partner.isActive,
      },
    });
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        style={{
          padding: "0.85rem 1rem",
          borderRadius: "0.8rem",
          background:
            "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(15, 23, 42, 0.02))",
          border: "1px solid rgba(99, 102, 241, 0.18)",
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
              color: "var(--primary)",
              marginBottom: "0.2rem",
            }}
          >
            Partner Management
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>
            Partners
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
              label: "Total Partners",
              value: partners.length,
              icon: Building2,
              color: "#2563eb",
            },
            {
              label: "Active",
              value: activePartners,
              icon: CheckCircle2,
              color: "#059669",
            },
            {
              label: "Managed Clients",
              value: totalClients,
              icon: Shield,
              color: "#7c3aed",
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

      {showPartnerFormModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowPartnerFormModal(false);
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
                    {formMode === "create"
                      ? "Create New Partner"
                      : "Edit Partner"}
                  </h2>
                  <p
                    style={{ color: "var(--secondary)", marginTop: "0.35rem" }}
                  >
                    Capture core identity, login access, and company details in
                    one step.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowPartnerFormModal(false);
                    resetForm();
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 36,
                    height: 36,
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    backgroundColor: "transparent",
                    color: "var(--foreground)",
                  }}
                >
                  <X size={16} />
                </button>
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
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "1rem 1.25rem",
                  }}
                >
                  {[
                    {
                      key: "name",
                      label: "Name",
                      placeholder: "Aarav Mehta",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "email",
                      label: "Email",
                      placeholder: "partner@company.com",
                      type: "email",
                      required: false,
                    },
                    {
                      key: "companyName",
                      label: "Company Name",
                      placeholder: "Nimbus Distribution",
                      type: "text",
                      required: true,
                    },
                    {
                      key: "location",
                      label: "Location",
                      placeholder: "Bengaluru, Karnataka",
                      type: "text",
                      required: true,
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
                        {field.required && (
                          <span
                            style={{ color: "#dc2626", marginLeft: "0.15rem" }}
                          >
                            *
                          </span>
                        )}
                      </label>
                      <input
                        type={field.type}
                        className="form-input"
                        placeholder={field.placeholder}
                        value={formState[field.key as keyof PartnerFormState]}
                        onChange={(event) =>
                          setFormState((current) => ({
                            ...current,
                            [field.key]: event.target.value,
                          }))
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
                    onChange={(value) => {
                      setFormState((current) => ({
                        ...current,
                        mobileNumber: value,
                      }));
                      setFormErrors((current) => ({
                        ...current,
                        mobileNumber: "",
                      }));
                    }}
                    error={formErrors.mobileNumber}
                    placeholder="9876543210 or +919876543210"
                    required
                    showPrefix
                  />

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        marginBottom: "0.5rem",
                      }}
                    >
                      Password
                      {formMode === "create" && (
                        <span
                          style={{ color: "#dc2626", marginLeft: "0.15rem" }}
                        >
                          *
                        </span>
                      )}
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder={
                        formMode === "create"
                          ? "Create a secure password"
                          : "Password is unchanged during profile edits"
                      }
                      value={formState.password}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      disabled={formMode === "edit"}
                      style={{
                        marginBottom: 0,
                        opacity: formMode === "edit" ? 0.6 : 1,
                        borderColor: formErrors.password
                          ? "#ef4444"
                          : undefined,
                      }}
                    />
                    {formErrors.password && (
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "#dc2626",
                          marginTop: "0.35rem",
                        }}
                      >
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: "1.25rem" }}>
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
                      setFormState((prev) => ({ ...prev, pinCode: pin }));
                      onPinChange(pin);
                    }}
                  />
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
                    Email is optional. Partners can still sign in with their
                    mobile number.
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
                    {formMode === "create" ? "Create Partner" : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      )}

      <section
        style={{
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
                  All Partners
                </h2>
                <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                  Search accounts, filter by status, and review operational
                  details.
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
                    setShowPartnerDetails(false);
                    resetForm();
                    setShowPartnerFormModal(true);
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
                  Create Partner
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
                  {filteredPartners.length} showing
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(0, 1.6fr) minmax(180px, 0.7fr) minmax(180px, 0.7fr)",
                gap: "0.85rem",
              }}
            >
              <div style={{ position: "relative" }}>
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
                  placeholder="Search by partner, company, email, or mobile"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  style={{ marginBottom: 0, paddingLeft: "2.5rem" }}
                />
              </div>

              <select
                className="form-input"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                style={{ marginBottom: 0 }}
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>

              <select
                className="form-input"
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
                style={{ marginBottom: 0 }}
              >
                <option value="all">All locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                color: "var(--secondary)",
              }}
            >
              Loading partners...
            </div>
          ) : filteredPartners.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <Building2
                size={42}
                style={{ opacity: 0.45, marginBottom: "1rem" }}
              />
              <h3 style={{ fontSize: "1.1rem", fontWeight: 800 }}>
                No partners found
              </h3>
              <p style={{ color: "var(--secondary)", marginTop: "0.5rem" }}>
                Try broadening your filters or create the first partner account.
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Actions</th>
                    <th>Company</th>
                    <th>Partner</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Location</th>
                    <th>Clients</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map((partner) => {
                    const isSelected =
                      selectedPartner?.partnerId === partner.partnerId;

                    return (
                      <tr
                        key={partner.partnerId}
                        onClick={() => setSelectedPartnerId(partner.partnerId)}
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
                                handleViewDetails(partner.partnerId);
                              }}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              title="Edit partner"
                              onClick={(event) => {
                                event.stopPropagation();
                                startEditing(partner);
                              }}
                            >
                              <Pencil size={14} />
                            </button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {partner.companyName}
                        </td>
                        <td>{partner.name}</td>
                        <td>{partner.mobileNumber}</td>
                        <td>
                          {partner.email || (
                            <span style={{ color: "var(--secondary)" }}>
                              None
                            </span>
                          )}
                        </td>
                        <td>
                          {partner.companyAddress || (
                            <span style={{ color: "var(--secondary)" }}>
                              None
                            </span>
                          )}
                        </td>
                        <td>{partner.clientCount}</td>
                        <td>
                          <span
                            style={{
                              padding: "0.25rem 0.55rem",
                              borderRadius: "999px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              backgroundColor: partner.isActive
                                ? "rgba(16, 185, 129, 0.12)"
                                : "rgba(239, 68, 68, 0.12)",
                              color: partner.isActive ? "#047857" : "#b91c1c",
                            }}
                          >
                            {partner.isActive ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td>{formatDate(partner.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {showPartnerDetails && (
        <div
          className="modal-overlay"
          onClick={() => setShowPartnerDetails(false)}
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
              <h2>Partner Details</h2>
              <button
                className="modal-close"
                onClick={() => setShowPartnerDetails(false)}
              >
                <X size={20} />
              </button>
            </div>

            {selectedPartner ? (
              <>
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
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--primary)",
                      }}
                    >
                      Partner Details
                    </p>
                    <h2
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: 800,
                        marginTop: "0.45rem",
                      }}
                    >
                      {selectedPartner.companyName}
                    </h2>
                  </div>

                  <span
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: "999px",
                      backgroundColor: selectedPartner.isActive
                        ? "rgba(16, 185, 129, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                      color: selectedPartner.isActive ? "#047857" : "#b91c1c",
                      fontWeight: 700,
                      fontSize: "0.78rem",
                    }}
                  >
                    {selectedPartner.isActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "1.25rem",
                    padding: "1rem",
                    borderRadius: "0.9rem",
                    background:
                      "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.02))",
                  }}
                >
                  <div style={{ display: "grid", gap: "0.9rem" }}>
                    {[
                      {
                        icon: UserRound,
                        label: "Partner Name",
                        value: selectedPartner.name,
                      },
                      {
                        icon: Phone,
                        label: "Mobile",
                        value: selectedPartner.mobileNumber,
                      },
                      {
                        icon: Building2,
                        label: "Email",
                        value: selectedPartner.email || "Not provided",
                      },
                      {
                        icon: MapPin,
                        label: "Location",
                        value: selectedPartner.companyAddress || "Not provided",
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "0.8rem",
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: "0.75rem",
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon size={15} color="var(--primary)" />
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
                            <p style={{ fontWeight: 700 }}>{item.value}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "0.85rem",
                    marginTop: "1.25rem",
                  }}
                >
                  {[
                    { label: "Clients", value: selectedPartner.clientCount },
                    {
                      label: "Last Login",
                      value: selectedPartner.lastLoginAt
                        ? formatDate(selectedPartner.lastLoginAt)
                        : "No login yet",
                    },
                    {
                      label: "Created",
                      value: formatDate(selectedPartner.createdAt),
                    },
                    { label: "Disabled", value: disabledPartners },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      style={{
                        padding: "0.95rem",
                        borderRadius: "0.85rem",
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--secondary)",
                        }}
                      >
                        {metric.label}
                      </p>
                      <p style={{ fontWeight: 800, marginTop: "0.35rem" }}>
                        {metric.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "0.75rem",
                    marginTop: "1.25rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowPartnerDetails(false);
                      startEditing(selectedPartner);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.6rem",
                      padding: "0.9rem 1rem",
                      borderRadius: "999px",
                      border: "1px solid var(--border)",
                      backgroundColor: "transparent",
                      fontWeight: 700,
                    }}
                  >
                    <Pencil size={16} />
                    Edit Partner Details
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePartnerStatus(selectedPartner)}
                    disabled={updateMutation.isPending}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.6rem",
                      padding: "0.9rem 1rem",
                      borderRadius: "999px",
                      border: "none",
                      backgroundColor: selectedPartner.isActive
                        ? "#b91c1c"
                        : "#047857",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    {updateMutation.isPending ? (
                      <Loader
                        size={16}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Power size={16} />
                    )}
                    {selectedPartner.isActive
                      ? "Disable Partner"
                      : "Enable Partner"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "var(--secondary)" }}>
                <Building2
                  size={40}
                  style={{ opacity: 0.45, marginBottom: "1rem" }}
                />
                <h3 style={{ fontWeight: 800, color: "var(--foreground)" }}>
                  Select a partner
                </h3>
                <p style={{ marginTop: "0.5rem" }}>
                  Details and quick actions appear here once a partner is
                  selected.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
