import { useMutation, useQuery } from "@tanstack/react-query";
import { useToastStore } from "../store/toastStore";
import {
  reportService,
  type ReportFilters,
  type ReportQueryParams,
} from "../services/reportService";

export const reportQueryKeys = {
  all: ["reports"] as const,
  summary: (filters: ReportFilters, isAdmin?: boolean) =>
    ["reports", "summary", filters, isAdmin ? "admin" : "user"] as const,
  messages: (filters: ReportQueryParams, isAdmin?: boolean) =>
    ["reports", "messages", filters, isAdmin ? "admin" : "user"] as const,
};

export const useReportSummary = (filters: ReportFilters, isAdmin?: boolean) =>
  useQuery({
    queryKey: reportQueryKeys.summary(filters, isAdmin),
    queryFn: () => reportService.getSummary(filters, isAdmin),
  });

export const useReportMessages = (
  filters: ReportQueryParams,
  isAdmin?: boolean,
) =>
  useQuery({
    queryKey: reportQueryKeys.messages(filters, isAdmin),
    queryFn: () => reportService.getMessages(filters, isAdmin),
  });

export const useExportReport = (isAdmin?: boolean) => {
  const addToast = useToastStore((state) => state.addToast);

  return useMutation({
    mutationFn: (filters: ReportFilters) =>
      reportService.exportCsv(filters, isAdmin),
    onError: () => {
      addToast("Unable to export the report right now.", "error");
    },
  });
};
