import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminClientService } from "../services/adminService";
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
import type { ReportFilters } from "../services/reportService";
import { useToastStore } from "../store/toastStore";

const DEFAULT_PAGE_SIZE = 10;

export const AdminMessageReportsPage: React.FC = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [draftFilters, setDraftFilters] = useState<ReportFilters>({
    clientId: undefined,
    status: "",
    fromDate: "",
    toDate: "",
  });
  const [appliedFilters, setAppliedFilters] =
    useState<ReportFilters>(draftFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const debouncedAppliedFilters = useDebouncedValue(appliedFilters, 250);

  const { data: clients = [] } = useQuery({
    queryKey: ["admin-report-clients"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const clientOptions: ReportClientOption[] = useMemo(
    () => clients.map((client) => ({ value: client.id, label: client.name })),
    [clients],
  );

  const summaryQuery = useReportSummary(debouncedAppliedFilters, true);
  const messagesQuery = useReportMessages(
    {
      ...debouncedAppliedFilters,
      page,
      pageSize,
    },
    true,
  );
  const exportMutation = useExportReport(true);

  const exportCsv = () => {
    exportMutation.mutate(debouncedAppliedFilters, {
      onSuccess: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `admin-message-reports-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-")}.csv`;
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
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
              Report Filters
            </h3>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--secondary)",
                marginTop: "0.2rem",
              }}
            >
              Slice message delivery analytics by client, status, and delivery
              window.
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
          pageSize={pageSize}
          isApplying={summaryQuery.isFetching || messagesQuery.isFetching}
          onChange={setDraftFilters}
          onApply={() => {
            setPage(1);
            setAppliedFilters(draftFilters);
          }}
          onReset={() => {
            const resetFilters = {
              clientId: undefined,
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
