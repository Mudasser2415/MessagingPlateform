import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from "@tanstack/react-table";
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
import "./AdminClientManagementPage.css";

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
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
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

  useEffect(() => {
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  }, [deferredSearch, businessTypeFilter, partnerFilter]);

  const selectedClient =
    selectedClientDetail ||
    filteredClients.find((client) => client.id === selectedClientId) ||
    clients.find((client) => client.id === selectedClientId) ||
    null;

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

  const clientColumns = useMemo<ColumnDef<AdminClientDetail>[]>(
    () => [
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const client = row.original;

          return (
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
          );
        },
      },
      {
        accessorKey: "name",
        header: "Client",
        cell: ({ row }) => (
          <span className="admin-client-management-page__client-name">
            {row.original.name}
          </span>
        ),
      },
      {
        id: "partner",
        header: "Partner",
        cell: ({ row }) =>
          row.original.partnerCompanyName || (
            <span className="admin-client-management-page__muted">None</span>
          ),
      },
      {
        accessorKey: "mobileNumber",
        header: "Mobile",
      },
      {
        accessorKey: "location",
        header: "Location",
      },
      {
        accessorKey: "businessType",
        header: "Business",
      },
      {
        accessorKey: "groupCount",
        header: "Groups",
      },
      {
        accessorKey: "messageCount",
        header: "Messages",
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const client = row.original;

          return (
            <span
              className={`admin-client-management-page__status-pill${client.partnerId ? " admin-client-management-page__status-pill--assigned" : " admin-client-management-page__status-pill--unassigned"}`}
            >
              {client.partnerId ? "Assigned" : "Unassigned"}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
    ],
    [],
  );

  const clientTable = useReactTable({
    data: filteredClients,
    columns: clientColumns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div className="admin-client-management-page">
      {showClientFormModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowClientFormModal(false);
            resetForm();
          }}
        >
          <div
            className="modal-content admin-client-management-page__modal-content--form"
            onClick={(event) => event.stopPropagation()}
          >
            <section className="admin-client-management-page__modal-panel">
              <div className="admin-client-management-page__modal-topbar">
                <div>
                  <h2 className="admin-client-management-page__modal-title">
                    {formMode === "create" ? "Create Client" : "Edit Client"}
                  </h2>
                  <p className="admin-client-management-page__modal-copy">
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
                    className="admin-client-management-page__close-button"
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
                    className="admin-client-management-page__close-button admin-client-management-page__close-button--icon-only"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {formMessage && (
                <div
                  className={`admin-client-management-page__message ${
                    formMessage.toLowerCase().includes("success")
                      ? "admin-client-management-page__message--success"
                      : "admin-client-management-page__message--error"
                  }`}
                >
                  <AlertTriangle size={16} />
                  <span>{formMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="admin-client-management-page__form-grid">
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
                      <label className="admin-client-management-page__label">
                        {field.label}
                        <span className="admin-client-management-page__required">
                          *
                        </span>
                      </label>
                      <input
                        type={field.type}
                        className={`form-input${formErrors[field.key] ? " admin-client-management-page__input--error" : ""}`}
                        placeholder={field.placeholder}
                        value={formState[field.key as keyof ClientFormState]}
                        onChange={(event) =>
                          setFieldValue(
                            field.key as keyof ClientFormState,
                            event.target.value,
                          )
                        }
                      />
                      {formErrors[field.key] && (
                        <p className="admin-client-management-page__field-error">
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
                    placeholder="Enter mobile number"
                    required
                    showPrefix
                  />

                  <div>
                    <label className="admin-client-management-page__label">
                      Business Type
                      <span className="admin-client-management-page__required">
                        *
                      </span>
                    </label>
                    <select
                      className={`form-input admin-client-management-page__select-input${formErrors.businessType ? " admin-client-management-page__input--error" : ""}`}
                      value={formState.businessType}
                      onChange={(event) =>
                        setFieldValue("businessType", event.target.value)
                      }
                    >
                      <option value="">Select a business type</option>
                      {businessTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    {formErrors.businessType && (
                      <p className="admin-client-management-page__field-error">
                        {formErrors.businessType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="admin-client-management-page__label">
                      Partner
                    </label>
                    <select
                      className={`form-input admin-client-management-page__select-input${formErrors.partnerId ? " admin-client-management-page__input--error" : ""}`}
                      value={formState.partnerId}
                      onChange={(event) =>
                        setFieldValue("partnerId", event.target.value)
                      }
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
                    <p className="admin-client-management-page__field-help">
                      Leave this blank to create an unassigned client.
                    </p>
                  </div>

                  <div className="admin-client-management-page__field--wide">
                    <label className="admin-client-management-page__label">
                      Street / Building Address
                      <span className="admin-client-management-page__required">
                        *
                      </span>
                    </label>
                    <textarea
                      className={`form-input admin-client-management-page__textarea${formErrors.address ? " admin-client-management-page__input--error" : ""}`}
                      placeholder="Enter street / building address (area details auto-fill below via PIN)"
                      value={formState.address}
                      onChange={(event) =>
                        setFieldValue("address", event.target.value)
                      }
                      rows={2}
                    />
                    {formErrors.address && (
                      <p className="admin-client-management-page__field-error">
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* ── PIN Code Address Auto-fill ────────────────────────────── */}
                  <div className="admin-client-management-page__field--wide">
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

                <div className="admin-client-management-page__footer">
                  <p className="admin-client-management-page__footer-copy">
                    Client access credentials are provisioned automatically
                    during admin creation.
                  </p>

                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="admin-client-management-page__submit-button"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader
                        size={16}
                        className="admin-client-management-page__spin"
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

      <section className="admin-client-management-page__section">
        <div className="admin-client-management-page__directory-panel">
          <div className="admin-client-management-page__directory-header">
            <div className="admin-client-management-page__section-topbar">
              <div>
                <h2 className="admin-client-management-page__section-title">
                  Client Directory
                </h2>
                <p className="admin-client-management-page__section-copy">
                  Search clients, narrow by partner or business type, then open
                  the full detail view.
                </p>
              </div>
              <div className="admin-client-management-page__section-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowClientDetails(false);
                    resetForm();
                    setShowClientFormModal(true);
                  }}
                  className="btn btn-primary admin-client-management-page__create-button"
                >
                  <Plus size={14} />
                  Create Client
                </button>
                <div className="admin-client-management-page__count-badge">
                  {filteredClients.length} showing
                </div>
              </div>
            </div>

            <div className="admin-client-management-page__filters">
              <div className="admin-client-management-page__search-field">
                <Search
                  size={16}
                  className="admin-client-management-page__search-icon"
                />
                <input
                  type="text"
                  className="form-input admin-client-management-page__search-input"
                  placeholder="Search by client, location, phone, or partner"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
              </div>

              <select
                className="form-input admin-client-management-page__select-input"
                value={businessTypeFilter}
                onChange={(event) => setBusinessTypeFilter(event.target.value)}
              >
                <option value="">All business types</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                className="form-input admin-client-management-page__select-input"
                value={partnerFilter}
                onChange={(event) => setPartnerFilter(event.target.value)}
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
            <div className="admin-client-management-page__loading-state">
              Loading clients...
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="admin-client-management-page__empty-state">
              <Users
                size={42}
                className="admin-client-management-page__empty-icon"
              />
              <h3 className="admin-client-management-page__empty-title">
                No clients found
              </h3>
              <p className="admin-client-management-page__empty-copy">
                Try broadening your filters or create the first client record.
              </p>
            </div>
          ) : (
            <>
              <table className="admin-client-management-page__table">
                <thead>
                  {clientTable.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {clientTable.getRowModel().rows.map((row) => {
                    const client = row.original;
                    const isSelected = selectedClient?.id === client.id;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedClientId(client.id)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: isSelected
                            ? "rgba(99, 102, 241, 0.06)"
                            : undefined,
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div
                className="admin-client-management-page__table-footer"
                style={{
                  padding: "1rem 1.5rem 1.25rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div className="admin-client-management-page__table-summary">
                  {filteredClients.length === 0
                    ? "No clients to display"
                    : `Showing ${Math.min(
                        clientTable.getState().pagination.pageIndex *
                          clientTable.getState().pagination.pageSize +
                          1,
                        filteredClients.length,
                      )} to ${Math.min(
                        (clientTable.getState().pagination.pageIndex + 1) *
                          clientTable.getState().pagination.pageSize,
                        filteredClients.length,
                      )} of ${filteredClients.length} clients`}
                </div>

                <div
                  className="admin-client-management-page__table-pagination"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                  }}
                >
                  <select
                    className="form-input admin-client-management-page__page-size"
                    value={clientTable.getState().pagination.pageSize}
                    onChange={(event) => {
                      clientTable.setPageSize(Number(event.target.value));
                      clientTable.setPageIndex(0);
                    }}
                    style={{
                      marginBottom: 0,
                      width: "auto",
                      minWidth: "110px",
                    }}
                    aria-label="Rows per page"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>

                  <div
                    className="admin-client-management-page__table-page-controls"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm admin-client-management-page__table-page-button"
                      onClick={() => clientTable.previousPage()}
                      disabled={!clientTable.getCanPreviousPage()}
                    >
                      Prev
                    </button>
                    <span className="admin-client-management-page__table-page-summary">
                      Page {clientTable.getState().pagination.pageIndex + 1} of{" "}
                      {clientTable.getPageCount()}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm admin-client-management-page__table-page-button"
                      onClick={() => clientTable.nextPage()}
                      disabled={!clientTable.getCanNextPage()}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {showClientDetails && (
        <div
          className="modal-overlay"
          onClick={() => setShowClientDetails(false)}
        >
          <div
            className="modal-content admin-client-management-page__modal-content--details"
            onClick={(event) => event.stopPropagation()}
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
              <div className="admin-client-management-page__loading-state">
                Loading client details...
              </div>
            ) : !selectedClient ? (
              <div className="admin-client-management-page__empty-state">
                <Users
                  size={40}
                  className="admin-client-management-page__empty-icon"
                />
                <h3 className="admin-client-management-page__empty-title">
                  Select a client
                </h3>
                <p className="admin-client-management-page__empty-copy">
                  Pick any client from the directory to inspect its current
                  details.
                </p>
              </div>
            ) : (
              <>
                <div className="admin-client-management-page__detail-banner">
                  <div className="admin-client-management-page__detail-topbar">
                    <div>
                      <p className="admin-client-management-page__detail-label">
                        Active Record
                      </p>
                      <h3 className="admin-client-management-page__detail-title">
                        {selectedClient.name}
                      </h3>
                      <p className="admin-client-management-page__detail-copy">
                        {selectedClient.businessType}
                      </p>
                    </div>

                    <span
                      className={`admin-client-management-page__detail-status${selectedClient.partnerId ? " admin-client-management-page__detail-status--linked" : " admin-client-management-page__detail-status--missing"}`}
                    >
                      {selectedClient.partnerId
                        ? "Partner linked"
                        : "Partner missing"}
                    </span>
                  </div>
                </div>

                <div className="admin-client-management-page__metrics-grid">
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
                        className="admin-client-management-page__metric-card"
                      >
                        <Icon size={16} color={metric.color} />
                        <p className="admin-client-management-page__metric-label">
                          {metric.label}
                        </p>
                        <p className="admin-client-management-page__metric-value">
                          {metric.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="admin-client-management-page__detail-grid">
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
                        className="admin-client-management-page__detail-card"
                      >
                        <div className="admin-client-management-page__detail-icon-wrap">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="admin-client-management-page__detail-text-label">
                            {item.label}
                          </p>
                          <p className="admin-client-management-page__detail-text-value">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="admin-client-management-page__detail-footer">
                  <div>
                    <p className="admin-client-management-page__detail-text-label">
                      Created On
                    </p>
                    <p className="admin-client-management-page__detail-text-value">
                      {formatDate(selectedClient.createdAt)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowClientDetails(false);
                      startEditing(selectedClient);
                    }}
                    className="admin-client-management-page__edit-button"
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
