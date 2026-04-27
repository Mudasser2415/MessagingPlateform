import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard } from "../components/CreditCard";
import { FilterBar } from "../components/FilterBar";
import { TransactionTable } from "../components/TransactionTable";
import { useCreditTransactions } from "../hooks/useCredits";
import { mappingService } from "../services/mappingService";
import { useAuthStore } from "../store/authStore";
import type { CreditTransactionType } from "../services/creditService";

export const CreditTransactionsPage: React.FC = () => {
  const { user, selectedClientId } = useAuthStore();
  const [clientId, setClientId] = useState("");
  const [type, setType] = useState<CreditTransactionType | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: assignedClients = [] } = useQuery({
    queryKey: ["employee-assigned-clients", user?.id],
    queryFn: () => mappingService.getAssignedClientsForEmployee(user?.id || ""),
    enabled: user?.role === "Employee" && Boolean(user?.id),
  });

  useEffect(() => {
    if (selectedClientId) {
      setClientId(selectedClientId);
      return;
    }

    if (!clientId && assignedClients.length > 0) {
      setClientId(assignedClients[0].clientId);
    }
  }, [assignedClients, clientId, selectedClientId]);

  const transactionsQuery = useCreditTransactions({
    clientId: clientId || undefined,
    type,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    pageSize,
  });

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <CreditCard
        clientId={clientId || null}
        title="Current Client Balance"
        emptyMessage="Pick an assigned client to review available credits and recent debit activity."
        actionPath="/credits"
      />

      <FilterBar
        clientOptions={assignedClients.map((client) => ({
          value: client.clientId,
          label: client.clientName,
        }))}
        clientId={clientId}
        type={type}
        fromDate={fromDate}
        toDate={toDate}
        pageSize={pageSize}
        onClientChange={(value) => {
          setClientId(value);
          setPage(1);
        }}
        onTypeChange={(value) => {
          setType(value);
          setPage(1);
        }}
        onFromDateChange={(value) => {
          setFromDate(value);
          setPage(1);
        }}
        onToDateChange={(value) => {
          setToDate(value);
          setPage(1);
        }}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
        }}
        onReset={() => {
          setClientId(selectedClientId || assignedClients[0]?.clientId || "");
          setType("");
          setFromDate("");
          setToDate("");
          setPage(1);
          setPageSize(10);
        }}
      />

      <TransactionTable
        data={transactionsQuery.data}
        isLoading={transactionsQuery.isLoading}
        error={
          transactionsQuery.error instanceof Error
            ? transactionsQuery.error.message
            : null
        }
        showClientColumn={assignedClients.length > 1}
        onPageChange={setPage}
      />
    </div>
  );
};
