import axiosInstance from "../utils/axiosInstance";

// ── Enums ─────────────────────────────────────────────────────────────────────

export type BillingPaymentStatus =
  | "Pending"
  | "PartiallyPaid"
  | "Approved"
  | "Rejected"
  | "Draft";

export type PaymentMethod =
  | "Cash"
  | "UPI"
  | "BankTransfer"
  | "Razorpay"
  | "Stripe";

// ── DTOs ──────────────────────────────────────────────────────────────────────

export interface PaymentReferenceDto {
  id: string;
  billingId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy?: string | null;
}

export interface BillingDto {
  id: string;
  billingNumber: string;
  quotationId: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: BillingPaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  // Approval
  approvedBy?: string | null;
  approvedAt?: string | null;
  approvalNotes?: string | null;
  // Rejection
  rejectedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  // Legacy
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  includedCredits: number;
  paymentReferences: PaymentReferenceDto[];
}

export interface CreateBillingRequest {
  quotationId: string;
  paymentMethod: number; // enum int value
  notes?: string;
}

// ── Auth header ───────────────────────────────────────────────────────────────

const adminHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

// ── Service ───────────────────────────────────────────────────────────────────

export const billingService = {
  getAll: async (
    paymentStatus?: string,
    clientId?: string,
    search?: string,
    page = 1,
    pageSize = 50,
  ): Promise<BillingDto[]> => {
    const params: Record<string, string | number | undefined> = {
      paymentStatus,
      clientId,
      search,
      page,
      pageSize,
    };
    Object.keys(params).forEach(
      (k) => params[k] === undefined && delete params[k],
    );
    const res = await axiosInstance.get("/billings", {
      ...adminHeaders(),
      params,
    });
    return res.data;
  },

  getById: async (id: string): Promise<BillingDto> => {
    const res = await axiosInstance.get(`/billings/${id}`, adminHeaders());
    return res.data;
  },

  create: async (data: CreateBillingRequest): Promise<BillingDto> => {
    const res = await axiosInstance.post("/billings", data, adminHeaders());
    return res.data;
  },

  uploadPayment: async (
    billingId: string,
    file: File,
  ): Promise<PaymentReferenceDto> => {
    const form = new FormData();
    form.append("billingId", billingId);
    form.append("file", file);
    const res = await axiosInstance.post("/billings/upload-payment", form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  verifyPayment: async (id: string): Promise<BillingDto> => {
    const res = await axiosInstance.post(
      `/billings/${id}/verify`,
      {},
      adminHeaders(),
    );
    return res.data;
  },

  approveBilling: async (
    id: string,
    approvalNotes?: string,
  ): Promise<BillingDto> => {
    const res = await axiosInstance.post(
      `/billings/${id}/approve`,
      { approvalNotes },
      adminHeaders(),
    );
    return res.data;
  },

  rejectBilling: async (
    id: string,
    rejectionReason: string,
  ): Promise<BillingDto> => {
    const res = await axiosInstance.post(
      `/billings/${id}/reject`,
      { rejectionReason },
      adminHeaders(),
    );
    return res.data;
  },
};
