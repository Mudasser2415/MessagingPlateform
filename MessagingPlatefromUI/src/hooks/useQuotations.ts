import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { quotationService } from "../services/quotationService";
import type {
  CreateQuotationRequest,
  UpdateQuotationRequest,
} from "../services/quotationService";

const QUOTATIONS_KEY = ["quotations"];
const SUMMARY_KEY = ["quotation-summary"];

export const useAllQuotations = (
  status?: string,
  search?: string,
  clientId?: string,
  page = 1,
  pageSize = 50,
) =>
  useQuery({
    queryKey: [...QUOTATIONS_KEY, status, search, clientId, page, pageSize],
    queryFn: () =>
      quotationService.getAll(status, search, clientId, page, pageSize),
  });

export const useQuotation = (id: string) =>
  useQuery({
    queryKey: [...QUOTATIONS_KEY, id],
    queryFn: () => quotationService.getById(id),
    enabled: !!id,
  });

export const useCreateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQuotationRequest) => quotationService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUOTATIONS_KEY }),
  });
};

export const useUpdateQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateQuotationRequest }) =>
      quotationService.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUOTATIONS_KEY }),
  });
};

export const useApproveQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationService.approve(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      qc.invalidateQueries({ queryKey: SUMMARY_KEY });
    },
  });
};

export const useRejectQuotation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => quotationService.reject(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUOTATIONS_KEY }),
  });
};

export const useQuotationSummary = () =>
  useQuery({
    queryKey: SUMMARY_KEY,
    queryFn: () => quotationService.getSummary(),
  });
