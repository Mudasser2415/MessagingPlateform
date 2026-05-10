import axiosInstance from "../utils/axiosInstance";

// ── Enums ─────────────────────────────────────────────────────────────────────
export type DurationType = "Monthly" | "Quarterly" | "HalfYearly" | "Yearly";
export type SubscriptionStatus = "Pending" | "Active" | "Expired" | "Cancelled";
export type PaymentStatus = "Pending" | "Paid" | "Failed";
export type PaymentMethod =
  | "Cash"
  | "UPI"
  | "BankTransfer"
  | "Razorpay"
  | "Stripe";

// ── Plans ─────────────────────────────────────────────────────────────────────
export interface SubscriptionPlan {
  id: string;
  planName: string;
  description: string;
  durationType: DurationType;
  durationInDays: number;
  price: number;
  includedCredits: number;
  gracePeriodDays: number;
  isTrial: boolean;
  maxUsers?: number | null;
  maxGroups?: number | null;
  maxTemplates?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreatePlanRequest {
  planName: string;
  description: string;
  durationType: DurationType;
  price: number;
  includedCredits: number;
  gracePeriodDays: number;
  isTrial: boolean;
  maxUsers?: number | null;
  maxGroups?: number | null;
  maxTemplates?: number | null;
}

export interface UpdatePlanRequest extends CreatePlanRequest {
  isActive: boolean;
}

// ── Subscriptions ─────────────────────────────────────────────────────────────
export interface ClientSubscription {
  id: string;
  clientId: string;
  clientName: string;
  subscriptionPlanId: string;
  planName: string;
  durationType: DurationType;
  planPrice: number;
  startDate: string;
  endDate: string;
  trialEndsAt?: string | null;
  status: SubscriptionStatus;
  totalCreditsAllocated: number;
  remainingCredits: number;
  autoRenew: boolean;
  lastRenewedAt?: string | null;
  createdAt: string;
  daysUntilExpiry: number;
  isInGracePeriod: boolean;
  gracePeriodDays: number;
}

export interface AssignSubscriptionRequest {
  clientId: string;
  subscriptionPlanId: string;
  startDate?: string;
  autoRenew: boolean;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
}

export interface RenewSubscriptionRequest {
  clientSubscriptionId: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
}

// ── Transactions ──────────────────────────────────────────────────────────────
export interface SubscriptionTransaction {
  id: string;
  clientSubscriptionId: string;
  clientName: string;
  planName: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionReference?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

// ── Summary ───────────────────────────────────────────────────────────────────
export interface SubscriptionSummary {
  totalActive: number;
  totalExpired: number;
  totalCancelled: number;
  expiringIn7Days: number;
  expiringIn30Days: number;
  totalRevenueThisMonth: number;
  totalCreditsAllocatedThisMonth: number;
}

const adminHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

export const subscriptionService = {
  // Plans
  getPlans: (includeInactive = false): Promise<SubscriptionPlan[]> =>
    axiosInstance
      .get(
        `/subscriptions/plans?includeInactive=${includeInactive}`,
        adminHeaders(),
      )
      .then((r) => r.data),

  createPlan: (body: CreatePlanRequest): Promise<SubscriptionPlan> =>
    axiosInstance
      .post("/subscriptions/plans", body, adminHeaders())
      .then((r) => r.data),

  updatePlan: (
    id: string,
    body: UpdatePlanRequest,
  ): Promise<SubscriptionPlan> =>
    axiosInstance
      .put(`/subscriptions/plans/${id}`, body, adminHeaders())
      .then((r) => r.data),

  // Client subscriptions
  getAllSubscriptions: (
    status?: string,
    search?: string,
  ): Promise<ClientSubscription[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    return axiosInstance
      .get(`/subscriptions?${params.toString()}`, adminHeaders())
      .then((r) => r.data);
  },

  getClientSubscription: (clientId: string): Promise<ClientSubscription> =>
    axiosInstance
      .get(`/subscriptions/client/${clientId}`, adminHeaders())
      .then((r) => r.data),

  assignSubscription: (
    body: AssignSubscriptionRequest,
  ): Promise<ClientSubscription> =>
    axiosInstance
      .post("/subscriptions/assign", body, adminHeaders())
      .then((r) => r.data),

  renewSubscription: (
    body: RenewSubscriptionRequest,
  ): Promise<ClientSubscription> =>
    axiosInstance
      .post("/subscriptions/renew", body, adminHeaders())
      .then((r) => r.data),

  cancelSubscription: (id: string): Promise<ClientSubscription> =>
    axiosInstance
      .post(`/subscriptions/cancel/${id}`, {}, adminHeaders())
      .then((r) => r.data),

  // Transactions
  getTransactions: (
    clientSubscriptionId?: string,
    clientId?: string,
    page = 1,
    pageSize = 50,
  ): Promise<SubscriptionTransaction[]> => {
    const params = new URLSearchParams();
    if (clientSubscriptionId)
      params.append("clientSubscriptionId", clientSubscriptionId);
    if (clientId) params.append("clientId", clientId);
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));
    return axiosInstance
      .get(`/subscriptions/transactions?${params.toString()}`, adminHeaders())
      .then((r) => r.data);
  },

  // Summary
  getSummary: (): Promise<SubscriptionSummary> =>
    axiosInstance
      .get("/subscriptions/summary", adminHeaders())
      .then((r) => r.data),
};
