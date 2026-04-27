import axiosInstance from "../utils/axiosInstance";

export type ReportStatus = "Delivered" | "Sent" | "Failed" | "Pending";

export interface ReportSummary {
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
  successRate: number;
}

export interface ReportItem {
  phoneNumber: string;
  messageContent: string;
  status: ReportStatus;
  createdAt: string;
  sentAt?: string | null;
}

export interface ReportPageResponse {
  items: ReportItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ReportFilters {
  clientId?: string;
  fromDate?: string;
  toDate?: string;
  status?: ReportStatus | "";
}

export interface ReportQueryParams extends ReportFilters {
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

const buildQueryString = (params: ReportQueryParams) => {
  const searchParams = new URLSearchParams();

  if (params.clientId) {
    searchParams.append("clientId", params.clientId);
  }

  if (params.status) {
    searchParams.append("status", params.status);
  }

  if (params.fromDate) {
    searchParams.append("fromDate", params.fromDate);
  }

  if (params.toDate) {
    searchParams.append("toDate", params.toDate);
  }

  if (params.page) {
    searchParams.append("page", String(params.page));
  }

  if (params.pageSize) {
    searchParams.append("pageSize", String(params.pageSize));
  }

  return searchParams.toString();
};

export const reportService = {
  getSummary: async (
    filters: ReportFilters,
    isAdmin?: boolean,
  ): Promise<ReportSummary> => {
    const queryString = buildQueryString(filters);
    const response = await axiosInstance.get<ReportSummary>(
      `/reports/summary?${queryString}`,
      getRequestConfig(isAdmin),
    );

    return response.data;
  },

  getMessages: async (
    params: ReportQueryParams,
    isAdmin?: boolean,
  ): Promise<ReportPageResponse> => {
    const queryString = buildQueryString(params);
    const response = await axiosInstance.get<ReportPageResponse>(
      `/reports/messages?${queryString}`,
      getRequestConfig(isAdmin),
    );

    return response.data;
  },

  exportCsv: async (
    filters: ReportFilters,
    isAdmin?: boolean,
  ): Promise<Blob> => {
    const queryString = buildQueryString(filters);
    const response = await axiosInstance.get(`/reports/export?${queryString}`, {
      ...getRequestConfig(isAdmin),
      responseType: "blob",
    });

    return response.data as Blob;
  },
};
