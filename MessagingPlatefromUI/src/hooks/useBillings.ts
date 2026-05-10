import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  billingService,
  type BillingDto,
  type CreateBillingRequest,
} from "../services/billingService";
import { useToastStore } from "../store/toastStore";

// ── Keys ──────────────────────────────────────────────────────────────────────

const BILLINGS_KEY = "billings";

// ── Queries ───────────────────────────────────────────────────────────────────

export const useAllBillings = (
  paymentStatus?: string,
  clientId?: string,
  search?: string,
) =>
  useQuery<BillingDto[]>({
    queryKey: [BILLINGS_KEY, { paymentStatus, clientId, search }],
    queryFn: () => billingService.getAll(paymentStatus, clientId, search),
    staleTime: 30_000,
  });

export const useBilling = (id: string) =>
  useQuery<BillingDto>({
    queryKey: [BILLINGS_KEY, id],
    queryFn: () => billingService.getById(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useCreateBilling = () => {
  const qc = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation<BillingDto, Error, CreateBillingRequest>({
    mutationFn: (data) => billingService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BILLINGS_KEY] });
      addToast("Billing created successfully.", "success");
    },
    onError: (err) => {
      addToast(err.message || "Failed to create billing.", "error");
    },
  });
};

export const useUploadPayment = () => {
  const qc = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation<unknown, Error, { billingId: string; file: File }>({
    mutationFn: ({ billingId, file }) =>
      billingService.uploadPayment(billingId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BILLINGS_KEY] });
      addToast("Payment proof uploaded.", "success");
    },
    onError: (err) => {
      addToast(err.message || "Upload failed.", "error");
    },
  });
};

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation<BillingDto, Error, string>({
    mutationFn: (id) => billingService.verifyPayment(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [BILLINGS_KEY] });
      addToast(
        `Payment verified. ${data.includedCredits} credits activated for client.`,
        "success",
      );
    },
    onError: (err) => {
      addToast(err.message || "Verification failed.", "error");
    },
  });
};
export const useApproveBilling = () => {
  const qc = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation<BillingDto, Error, { id: string; approvalNotes?: string }>(
    {
      mutationFn: ({ id, approvalNotes }) =>
        billingService.approveBilling(id, approvalNotes),
      onSuccess: (data) => {
        qc.invalidateQueries({ queryKey: [BILLINGS_KEY] });
        addToast(
          `Billing approved. ${data.includedCredits.toLocaleString()} credits activated for ${data.clientName}.`,
          "success",
        );
      },
      onError: (err) => {
        addToast(err.message || "Approval failed.", "error");
      },
    },
  );
};
export const useRejectBilling = () => {
  const qc = useQueryClient();
  const { addToast } = useToastStore();

  return useMutation<
    BillingDto,
    Error,
    { id: string; rejectionReason: string }
  >({
    mutationFn: ({ id, rejectionReason }) =>
      billingService.rejectBilling(id, rejectionReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [BILLINGS_KEY] });
      addToast("Billing rejected.", "success");
    },
    onError: (err) => {
      addToast(err.message || "Rejection failed.", "error");
    },
  });
};
