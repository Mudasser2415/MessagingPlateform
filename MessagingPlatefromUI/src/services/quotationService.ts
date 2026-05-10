import axiosInstance from "../utils/axiosInstance";
import type {
  ClientSubscription,
  AssignSubscriptionRequest,
  RenewSubscriptionRequest,
  SubscriptionSummary,
} from "./subscriptionService";

// Re-export types for convenience
export type {
  ClientSubscription,
  AssignSubscriptionRequest,
  RenewSubscriptionRequest,
  SubscriptionSummary,
  PaymentMethod,
} from "./subscriptionService";

const adminHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
});

export const quotationService = {
  getAll: (status?: string, search?: string): Promise<ClientSubscription[]> => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (search) params.append("search", search);
    return axiosInstance
      .get(`/quotations?${params.toString()}`, adminHeaders())
      .then((r) => r.data);
  },

  getByClient: (clientId: string): Promise<ClientSubscription> =>
    axiosInstance
      .get(`/quotations/client/${clientId}`, adminHeaders())
      .then((r) => r.data),

  assign: (body: AssignSubscriptionRequest): Promise<ClientSubscription> =>
    axiosInstance
      .post("/quotations/assign", body, adminHeaders())
      .then((r) => r.data),

  renew: (body: RenewSubscriptionRequest): Promise<ClientSubscription> =>
    axiosInstance
      .post("/quotations/renew", body, adminHeaders())
      .then((r) => r.data),

  cancel: (id: string): Promise<ClientSubscription> =>
    axiosInstance
      .post(`/quotations/cancel/${id}`, {}, adminHeaders())
      .then((r) => r.data),

  getSummary: (): Promise<SubscriptionSummary> =>
    axiosInstance
      .get("/quotations/summary", adminHeaders())
      .then((r) => r.data),
};
