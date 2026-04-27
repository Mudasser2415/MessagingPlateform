import axiosInstance from "../utils/axiosInstance";

export type CreditTransactionType = "Credit" | "Debit";

export interface CreditBalanceResponse {
  clientId: string;
  availableCredits: number;
}

export interface AddCreditsRequest {
  clientId: string;
  amount: number;
}

export interface CreditTransaction {
  id: string;
  clientId: string;
  clientName: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  reference: string;
  createdAt: string;
}

export interface CreditTransactionListResponse {
  items: CreditTransaction[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetCreditTransactionsParams {
  clientId?: string;
  type?: CreditTransactionType | "";
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

const getRequestConfig = (isAdmin?: boolean) =>
  isAdmin
    ? {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    : undefined;

const buildQueryString = (params: GetCreditTransactionsParams) => {
  const searchParams = new URLSearchParams();

  if (params.clientId) {
    searchParams.append("clientId", params.clientId);
  }

  if (params.type) {
    searchParams.append("type", params.type);
  }

  if (params.fromDate) {
    searchParams.append("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.append("toDate", params.toDate);
  }

  searchParams.append("page", String(params.page ?? 1));
  searchParams.append("pageSize", String(params.pageSize ?? 10));

  return searchParams.toString();
};

export const creditService = {
  getClientCredits: async (
    clientId: string,
    isAdmin?: boolean,
  ): Promise<CreditBalanceResponse> => {
    const response = await axiosInstance.get<CreditBalanceResponse>(
      `/credits/${clientId}`,
      getRequestConfig(isAdmin),
    );

    return response.data;
  },

  addCredits: async (
    payload: AddCreditsRequest,
  ): Promise<CreditBalanceResponse> => {
    const response = await axiosInstance.post<CreditBalanceResponse>(
      "/credits/add",
      payload,
      getRequestConfig(true),
    );

    return response.data;
  },

  getTransactions: async (
    params: GetCreditTransactionsParams,
    isAdmin?: boolean,
  ): Promise<CreditTransactionListResponse> => {
    const queryString = buildQueryString(params);
    const response = await axiosInstance.get<CreditTransactionListResponse>(
      `/credits/transactions?${queryString}`,
      getRequestConfig(isAdmin),
    );

    return response.data;
  },
};
