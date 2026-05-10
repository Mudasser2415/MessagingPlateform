import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quotationService } from "../services/quotationService";
import type {
  AssignSubscriptionRequest,
  RenewSubscriptionRequest,
} from "../services/quotationService";

const QUOTATIONS_KEY = ["quotations"];
const SUMMARY_KEY = ["quotation-summary"];

export const useAllQuotations = (status?: string, search?: string) =>
  useQuery({
    queryKey: [...QUOTATIONS_KEY, status, search],
    queryFn: () => quotationService.getAll(status, search),
  });

export const useClientQuotation = (clientId: string) =>
  useQuery({
    queryKey: [...QUOTATIONS_KEY, "client", clientId],
    queryFn: () => quotationService.getByClient(clientId),
    enabled: !!clientId,
    retry: false,
  });

export const useAssignQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AssignSubscriptionRequest) =>
      quotationService.assign(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useRenewQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RenewSubscriptionRequest) =>
      quotationService.renew(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useCancelQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationService.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useQuotationSummary = () =>
  useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: () => quotationService.getSummary(),
  });
