import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "../services/subscriptionService";
import type {
  CreatePlanRequest,
  UpdatePlanRequest,
  AssignSubscriptionRequest,
  RenewSubscriptionRequest,
} from "../services/subscriptionService";

const PLANS_KEY = ["subscription-plans"];
const SUBSCRIPTIONS_KEY = ["subscriptions"];
const TRANSACTIONS_KEY = ["subscription-transactions"];
const SUMMARY_KEY = ["subscription-summary"];

// ── Plans ─────────────────────────────────────────────────────────────────────
export const usePlans = (includeInactive = false) =>
  useQuery({
    queryKey: [...PLANS_KEY, includeInactive],
    queryFn: () => subscriptionService.getPlans(includeInactive),
  });

export const useCreatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePlanRequest) =>
      subscriptionService.createPlan(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS_KEY }),
  });
};

export const useUpdatePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePlanRequest }) =>
      subscriptionService.updatePlan(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: PLANS_KEY }),
  });
};

// ── Subscriptions ─────────────────────────────────────────────────────────────
export const useAllSubscriptions = (status?: string, search?: string) =>
  useQuery({
    queryKey: [...SUBSCRIPTIONS_KEY, status, search],
    queryFn: () => subscriptionService.getAllSubscriptions(status, search),
  });

export const useClientSubscription = (clientId: string) =>
  useQuery({
    queryKey: [...SUBSCRIPTIONS_KEY, "client", clientId],
    queryFn: () => subscriptionService.getClientSubscription(clientId),
    enabled: !!clientId,
    retry: false,
  });

export const useAssignSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignSubscriptionRequest) =>
      subscriptionService.assignSubscription(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useRenewSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RenewSubscriptionRequest) =>
      subscriptionService.renewSubscription(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
      qc.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
};

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => subscriptionService.cancelSubscription(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

// ── Transactions ──────────────────────────────────────────────────────────────
export const useTransactions = (
  clientSubscriptionId?: string,
  clientId?: string,
  page = 1,
  pageSize = 50,
) =>
  useQuery({
    queryKey: [
      ...TRANSACTIONS_KEY,
      clientSubscriptionId,
      clientId,
      page,
      pageSize,
    ],
    queryFn: () =>
      subscriptionService.getTransactions(
        clientSubscriptionId,
        clientId,
        page,
        pageSize,
      ),
  });

// ── Summary ───────────────────────────────────────────────────────────────────
export const useSubscriptionSummary = () =>
  useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: () => subscriptionService.getSummary(),
  });
