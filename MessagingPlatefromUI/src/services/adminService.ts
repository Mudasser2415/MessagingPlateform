import axiosInstance from "../utils/axiosInstance";
import { normalizeIndianMobileNumber } from "../utils/mobileValidation";

const authHeader = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("adminToken") || localStorage.getItem("token") || ""
  }`,
});

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  adminId: string;
  email: string;
  fullName: string;
  role: string;
  token: string;
}

export interface AdminClientDetail {
  id: string;
  partnerId?: string | null;
  partnerName?: string | null;
  partnerCompanyName?: string | null;
  name: string;
  email: string;
  mobileNumber: string;
  address: string;
  businessType: string;
  location: string;
  availableCredits: number;
  groupCount: number;
  messageCount: number;
  createdAt: string;
}

export interface CreateAdminClientRequest {
  partnerId?: string | null;
  name: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  emailId?: string | null;
}

export interface UpdateAdminClientRequest {
  partnerId?: string | null;
  name: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  emailId?: string | null;
}

export interface AdminPartner {
  partnerId: string;
  userId: string;
  name: string;
  email: string;
  mobileNumber: string;
  companyName: string;
  companyAddress: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  clientCount: number;
}

export interface CreatePartnerRequest {
  name: string;
  email: string | null;
  mobileNumber: string;
  password: string;
  companyName: string;
  companyAddress: string;
}

export interface UpdatePartnerRequest {
  name: string;
  email: string | null;
  mobileNumber: string;
  companyName: string;
  companyAddress: string;
  isActive: boolean;
}

export interface DailyMessageTrend {
  date: string;
  sent: number;
  delivered: number;
}

export interface TopClientVolume {
  clientId: string;
  clientName: string;
  messageCount: number;
}

export interface CreditUsageSummary {
  used: number;
  remaining: number;
}

export interface TicketStatusSummary {
  open: number;
  pending: number;
  resolved: number;
}

export interface RecentCampaign {
  title: string;
  summary: string;
  createdAt: string;
  status: string;
}

export interface RecentTicket {
  ticketNumber: string;
  clientName: string;
  issueDate: string;
  status: string;
}

export interface AdminDashboardStats {
  totalPartners: number;
  totalClients: number;
  messagesSentToday: number;
  deliveryRate: number;
  failedMessagesToday: number;
  openTickets: number;
  creditsRemaining: number;
  campaignsRunning: number;
  messageTrend: DailyMessageTrend[];
  topClientsByVolume: TopClientVolume[];
  creditUsage: CreditUsageSummary;
  ticketStatusSummary: TicketStatusSummary;
  recentCampaigns: RecentCampaign[];
  recentTickets: RecentTicket[];
}

export interface AuditLogRecord {
  id: string;
  entityName: string;
  entityId: string;
  action: "Create" | "Update" | "Delete";
  performedBy?: string | null;
  performedByName: string;
  timestamp: string;
  oldValues?: string | null;
  newValues?: string | null;
  ipAddress?: string | null;
}

export interface AuditLogListResponse {
  items: AuditLogRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetAuditLogsParams {
  entityName?: string;
  action?: string;
  performedBy?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export const adminAuthService = {
  login: async (
    email: string,
    password: string,
  ): Promise<AdminLoginResponse> => {
    const response = await axiosInstance.post<{
      token: string;
      adminId: string;
      email: string;
      fullName: string;
      role: string;
    }>("/admin/login", {
      email,
      password,
    });

    return {
      token: response.data.token,
      adminId: response.data.adminId,
      email: response.data.email,
      fullName: response.data.fullName,
      role: response.data.role,
    };
  },

  registerUser: async (
    name: string,
    mobileNumber: string,
    email: string | undefined,
    password: string,
    role: "Admin" | "Employee",
    canCreatePartners = false,
  ): Promise<AdminLoginResponse> => {
    const response = await axiosInstance.post<{
      token: string;
      userId: string;
      role: string;
      name: string;
      mobileNumber: string;
    }>("/user-auth/register", {
      name,
      mobileNumber: normalizeIndianMobileNumber(mobileNumber),
      email: email || null,
      password,
      role,
      canCreatePartners: role === "Employee" ? canCreatePartners : false,
    });

    // Map the response to AdminLoginResponse format
    return {
      token: response.data.token,
      adminId: response.data.userId,
      email: email || "",
      fullName: response.data.name,
      role: response.data.role,
    };
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  },
};

export const adminDashboardService = {
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    const response = await axiosInstance.get<AdminDashboardStats>(
      "/Admin/dashboard-stats",
      {
        headers: authHeader(),
      },
    );
    return response.data;
  },
};

export const adminClientService = {
  getAllClients: async (
    search?: string,
    businessType?: string,
  ): Promise<AdminClientDetail[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (businessType) params.append("businessType", businessType);

    const response = await axiosInstance.get<AdminClientDetail[]>(
      `/Admin/clients?${params.toString()}`,
      {
        headers: authHeader(),
      },
    );
    return response.data;
  },

  getClientById: async (id: string): Promise<AdminClientDetail> => {
    const response = await axiosInstance.get<AdminClientDetail>(
      `/Admin/clients/${id}`,
      {
        headers: authHeader(),
      },
    );
    return response.data;
  },

  createClient: async (
    payload: CreateAdminClientRequest,
  ): Promise<AdminClientDetail> => {
    const response = await axiosInstance.post<AdminClientDetail>(
      "/Admin/clients",
      {
        ...payload,
        mobileNumber: normalizeIndianMobileNumber(payload.mobileNumber),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      },
    );

    return response.data;
  },

  updateClient: async (
    clientId: string,
    payload: UpdateAdminClientRequest,
  ): Promise<AdminClientDetail> => {
    const response = await axiosInstance.put<AdminClientDetail>(
      `/Admin/clients/${clientId}`,
      {
        ...payload,
        mobileNumber: normalizeIndianMobileNumber(payload.mobileNumber),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      },
    );

    return response.data;
  },
};

export const adminPartnerService = {
  getAllPartners: async (search?: string): Promise<AdminPartner[]> => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);

    const response = await axiosInstance.get<AdminPartner[]>(
      `/admin/partners?${params.toString()}`,
      {
        headers: authHeader(),
      },
    );

    return response.data;
  },

  createPartner: async (
    payload: CreatePartnerRequest,
  ): Promise<AdminPartner> => {
    const response = await axiosInstance.post<AdminPartner>(
      "/admin/partners",
      {
        ...payload,
        mobileNumber: normalizeIndianMobileNumber(payload.mobileNumber),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      },
    );

    return response.data;
  },

  updatePartner: async (
    partnerId: string,
    payload: UpdatePartnerRequest,
  ): Promise<AdminPartner> => {
    const response = await axiosInstance.put<AdminPartner>(
      `/admin/partners/${partnerId}`,
      {
        ...payload,
        mobileNumber: normalizeIndianMobileNumber(payload.mobileNumber),
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      },
    );

    return response.data;
  },
};

export const adminAuditService = {
  getAuditLogs: async (
    params: GetAuditLogsParams,
  ): Promise<AuditLogListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.entityName) searchParams.append("entityName", params.entityName);
    if (params.action) searchParams.append("action", params.action);
    if (params.performedBy)
      searchParams.append("performedBy", params.performedBy);
    if (params.fromDate) searchParams.append("fromDate", params.fromDate);
    if (params.toDate) searchParams.append("toDate", params.toDate);
    searchParams.append("page", String(params.page ?? 1));
    searchParams.append("pageSize", String(params.pageSize ?? 20));

    const response = await axiosInstance.get<AuditLogListResponse>(
      `/audit?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      },
    );

    return response.data;
  },
};
