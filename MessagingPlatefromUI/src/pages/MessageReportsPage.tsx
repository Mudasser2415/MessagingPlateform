import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExportButton } from "../components/ExportButton";
import {
  ReportFilterBar,
  type ReportClientOption,
} from "../components/ReportFilterBar";
import { ReportSummaryCards } from "../components/ReportSummaryCards";
import { ReportTable } from "../components/ReportTable";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  useExportReport,
  useReportMessages,
  useReportSummary,
} from "../hooks/useReports";
import { mappingService } from "../services/mappingService";
import { partnerClientService } from "../services/partnerClientService";
import type { ReportFilters } from "../services/reportService";
import { useAuthStore } from "../store/authStore";
import { useToastStore } from "../store/toastStore";

const DEFAULT_PAGE_SIZE = 10;

export const MessageReportsPage: React.FC = () => {
  const { user, selectedClientId, setSelectedClientId } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const [draftFilters, setDraftFilters] = useState<ReportFilters>({
    clientId:
      user?.role === "Employee" ? selectedClientId || undefined : undefined,
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [appliedFilters, setAppliedFilters] =
    useState<ReportFilters>(draftFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedAppliedFilters = useDebouncedValue(appliedFilters, 250);

  const { data: assignedClients = [] } = useQuery({
    queryKey: ["employee-assigned-clients", user?.id],
    queryFn: () => mappingService.getAssignedClientsForEmployee(user?.id || ""),
    enabled: user?.role === "Employee" && Boolean(user?.id),
  });

  const { data: partnerClients = [] } = useQuery({
    queryKey: ["partner-clients", user?.id],
    queryFn: () => partnerClientService.getClients(),
    enabled: user?.role === "Partner",
  });

  const clientOptions: ReportClientOption[] = useMemo(() => {
    if (user?.role === "Employee") {
      return assignedClients.map((client) => ({
        value: client.clientId,
        label: client.clientName,
      }));
    }

    if (user?.role === "Partner") {
      return partnerClients.map((client) => ({
        value: client.id,
        label: client.name,
      }));
    }

    return [];
  }, [assignedClients, partnerClients, user?.role]);

  useEffect(() => {
    if (user?.role !== "Employee") {
      return;
    }

    const employeeClientId = selectedClientId || assignedClients[0]?.clientId;
    if (!employeeClientId) {
      return;
    }

    setDraftFilters((current) => ({ ...current, clientId: employeeClientId }));
    setAppliedFilters((current) => ({
      ...current,
      clientId: employeeClientId,
    }));
  }, [assignedClients, selectedClientId, user?.role]);

  const summaryQuery = useReportSummary(debouncedAppliedFilters);
  const messagesQuery = useReportMessages({
    ...debouncedAppliedFilters,
    page,
    pageSize,
  });
  const exportMutation = useExportReport();

  const exportCsv = () => {
    exportMutation.mutate(debouncedAppliedFilters, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `message-reports-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.URL.revokeObjectURL(url);
        addToast("Report exported successfully.", "success");
      },
    });
  };

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <section
        className="stat-card"
        style={{
          display: "grid",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Filters</h3>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--secondary)",
                marginTop: "0.2rem",
              }}
            >
              Apply client, status, and date filters to refine message delivery
              analytics.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "nowrap",
            }}
          >
            <ExportButton
              isLoading={exportMutation.isPending}
              onClick={exportCsv}
            />
            <div
              style={{
                flex: "0 0 auto",
                whiteSpace: "nowrap",
                padding: "0.45rem 0.8rem",
                borderRadius: "999px",
                backgroundColor: "rgba(99, 102, 241, 0.08)",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              {messagesQuery.data?.totalCount ?? 0} showing
            </div>
          </div>
        </div>

        <ReportFilterBar
          title=""
          subtitle=""
          embedded
          filters={draftFilters}
          clients={clientOptions}
          showClientFilter={clientOptions.length > 0}
          disableClientSelection={
            user?.role === "Employee" && clientOptions.length <= 1
          }
          pageSize={pageSize}
          isApplying={summaryQuery.isFetching || messagesQuery.isFetching}
          onChange={(next) => {
            setDraftFilters(next);
            if (user?.role === "Employee" && next.clientId) {
              setSelectedClientId(next.clientId);
            }
          }}
          onApply={() => {
            setPage(1);
            setAppliedFilters(draftFilters);
          }}
          onReset={() => {
            const resetFilters = {
              clientId:
                user?.role === "Employee"
                  ? selectedClientId ||
                    assignedClients[0]?.clientId ||
                    undefined
                  : undefined,
              status: "",
              fromDate: "",
              toDate: "",
            } satisfies ReportFilters;

            setDraftFilters(resetFilters);
            setAppliedFilters(resetFilters);
            setPage(1);
          }}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      </section>

      {summaryQuery.error instanceof Error ? (
        <div className="stat-card" style={{ color: "#b91c1c" }}>
          Unable to load report summary right now.
        </div>
      ) : null}

      <ReportTable
        data={messagesQuery.data}
        isLoading={messagesQuery.isLoading}
        error={
          messagesQuery.error instanceof Error
            ? messagesQuery.error.message
            : null
        }
        onPageChange={setPage}
      />
    </div>
  );
};
