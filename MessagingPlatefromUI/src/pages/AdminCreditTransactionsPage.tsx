import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterBar } from "../components/FilterBar";
import { TransactionTable } from "../components/TransactionTable";
import { useCreditTransactions } from "../hooks/useCredits";
import { adminClientService } from "../services/adminService";
import type { CreditTransactionType } from "../services/creditService";

export const AdminCreditTransactionsPage: React.FC = () => {
  const [clientId, setClientId] = useState("");
  const [type, setType] = useState<CreditTransactionType | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: clients = [] } = useQuery({
    queryKey: ["admin-credit-transaction-clients"],
    queryFn: () => adminClientService.getAllClients(),
  });

  const transactionsQuery = useCreditTransactions(
    {
      clientId: clientId || undefined,
      type,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      page,
      pageSize,
    },
    true,
  );

  return (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <FilterBar
        clientOptions={clients.map((client) => ({
          value: client.id,
          label: client.name,
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
          setClientId("");
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
        showClientColumn
        onPageChange={setPage}
      />
    </div>
  );
};
