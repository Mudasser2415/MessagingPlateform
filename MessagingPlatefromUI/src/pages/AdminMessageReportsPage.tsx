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
        style={{
          padding: "0.85rem 1rem",
          borderRadius: "0.8rem",
          background:
            "linear-gradient(135deg, rgba(216, 180, 254, 0.1), rgba(15, 23, 42, 0.03))",
          border: "1px solid rgba(168, 85, 247, 0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7c3aed",
              marginBottom: "0.2rem",
            }}
          >
            Operations
          </p>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>
            Message Reports
          </h1>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <ReportSummaryCards
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
            singleRow
            embedded
          />
        </div>
      </section>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <ReportFilterBar
          title="Report Filters"
          subtitle="Slice message delivery analytics by client, status, and delivery window."
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

        <div style={{ alignSelf: "flex-start" }}>
          <ExportButton
            isLoading={exportMutation.isPending}
            onClick={exportCsv}
          />
        </div>
      </div>

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
