import axiosInstance from "../utils/axiosInstance";

// ── Enums ─────────────────────────────────────────────────────────────────────
export type QuotationStatus =
  | "Draft"
  | "Sent"
  | "Approved"
  | "Rejected"
  | "Expired";

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface QuotationDto {
  id: string;
  quotationNumber: string;
  clientId: string;
  clientName: string;
  subscriptionPlanId: string;
  planName: string;
  durationType: string;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  includedCredits: number;
  validFrom: string;
  validTo: string;
  status: QuotationStatus;
  notes?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  isExpired: boolean;
}

export interface CreateQuotationRequest {
  clientId: string;
  subscriptionPlanId: string;
  discountAmount: number;
  validFrom: string;
  validTo: string;
  notes?: string;
}

export interface UpdateQuotationRequest {
  subscriptionPlanId: string;
  discountAmount: number;
  validFrom: string;
  validTo: string;
  notes?: string;
}

export interface QuotationSummaryDto {
  totalDraft: number;
  totalSent: number;
  totalApproved: number;
  totalRejected: number;
  totalExpired: number;
  expiringIn7Days: number;
  totalRevenueApproved: number;
}

// ── Service ───────────────────────────────────────────────────────────────────
const adminHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

export const quotationService = {
  getAll: (
    status?: string,
    search?: string,
    clientId?: string,
    page = 1,
    pageSize = 50,
  ): Promise<QuotationDto[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    if (clientId) params.append("clientId", clientId);
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));
    return axiosInstance
      .get(`/quotations?${params.toString()}`, adminHeaders())
      .then((r) => r.data);
  },

  getById: (id: string): Promise<QuotationDto> =>
    axiosInstance.get(`/quotations/${id}`, adminHeaders()).then((r) => r.data),

  create: (body: CreateQuotationRequest): Promise<QuotationDto> =>
    axiosInstance.post("/quotations", body, adminHeaders()).then((r) => r.data),

  update: (id: string, body: UpdateQuotationRequest): Promise<QuotationDto> =>
    axiosInstance
      .put(`/quotations/${id}`, body, adminHeaders())
      .then((r) => r.data),

  approve: (id: string): Promise<QuotationDto> =>
    axiosInstance
      .post(`/quotations/${id}/approve`, {}, adminHeaders())
      .then((r) => r.data),

  reject: (id: string): Promise<QuotationDto> =>
    axiosInstance
      .post(`/quotations/${id}/reject`, {}, adminHeaders())
      .then((r) => r.data),

  getSummary: (): Promise<QuotationSummaryDto> =>
    axiosInstance
      .get("/quotations/summary", adminHeaders())
      .then((r) => r.data),
};
