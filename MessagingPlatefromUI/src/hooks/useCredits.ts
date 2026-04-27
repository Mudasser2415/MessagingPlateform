import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  creditService,
  type AddCreditsRequest,
  type GetCreditTransactionsParams,
} from "../services/creditService";
import { useToastStore } from "../store/toastStore";

export const creditQueryKeys = {
  all: ["credits"] as const,
  balance: (clientId: string, isAdmin?: boolean) =>
    ["credits", "balance", clientId, isAdmin ? "admin" : "user"] as const,
  transactions: (params: GetCreditTransactionsParams, isAdmin?: boolean) =>
    ["credits", "transactions", params, isAdmin ? "admin" : "user"] as const,
};

export const useClientCredits = (
  clientId: string | null | undefined,
  isAdmin?: boolean,
) =>
  useQuery({
    queryKey: creditQueryKeys.balance(clientId || "", isAdmin),
    queryFn: () => creditService.getClientCredits(clientId || "", isAdmin),
    enabled: Boolean(clientId),
  });

export const useCreditTransactions = (
  params: GetCreditTransactionsParams,
  isAdmin?: boolean,
) =>
  useQuery({
    queryKey: creditQueryKeys.transactions(params, isAdmin),
    queryFn: () => creditService.getTransactions(params, isAdmin),
  });

export const useAddCredits = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (payload: AddCreditsRequest) =>
      creditService.addCredits(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: creditQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin-credits-clients"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-dashboard-clients-count"],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      queryClient.invalidateQueries({
        queryKey: ["employee-assigned-clients"],
      });
      queryClient.invalidateQueries({
        queryKey: creditQueryKeys.balance(variables.clientId, true),
      });
      addToast("Credits added successfully.", "success");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to add credits right now.";
      addToast(message, "error");
    },
  });
};
