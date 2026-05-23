import axiosInstance from "../utils/axiosInstance";

// ── Enums ─────────────────────────────────────────────────────────────────────
export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketType = "INC" | "SR";
export type TicketStatus =
  | "Open"
  | "InProgress"
  | "Resolved"
  | "Closed"
  | "Rejected";
export type SlaStatus = "Met" | "Breached";

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface TicketDto {
  ticketId: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  mobileNumber: string;
  issueDate: string;
  issueDescription: string;
  priority: TicketPriority;
  ticketType: TicketType;
  status: TicketStatus;
  resolutionDescription: string | null;
  slaStatus: SlaStatus;
  assignedToUserId: string | null;
  assignedToName: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketPagedResponse {
  items: TicketDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateTicketRequest {
  clientId: string;
  mobileNumber: string;
  issueDescription: string;
  priority: TicketPriority;
  ticketType: TicketType;
}

export interface UpdateTicketRequest {
  status?: TicketStatus;
  resolutionDescription?: string;
  assignedToUserId?: string;
}

export interface TicketQueryParams {
  search?: string;
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  ticketType?: TicketType | "";
  slaStatus?: SlaStatus | "";
  clientId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────
export const ticketService = {
  getAll: async (params: TicketQueryParams): Promise<TicketPagedResponse> => {
    // Strip empty strings and undefined values so they are not sent as query params
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== "" && v !== undefined && v !== null,
      ),
    );
    const response = await axiosInstance.get<TicketPagedResponse>("/tickets", {
      params: cleanParams,
    });
    return response.data;
  },

  getById: async (id: string): Promise<TicketDto> => {
    const response = await axiosInstance.get<TicketDto>(`/tickets/${id}`);
    return response.data;
  },

  create: async (body: CreateTicketRequest): Promise<TicketDto> => {
    const response = await axiosInstance.post<TicketDto>("/tickets", body);
    return response.data;
  },

  update: async (id: string, body: UpdateTicketRequest): Promise<TicketDto> => {
    const response = await axiosInstance.put<TicketDto>(`/tickets/${id}`, body);
    return response.data;
  },

  close: async (id: string): Promise<TicketDto> => {
    const response = await axiosInstance.post<TicketDto>(
      `/tickets/${id}/close`,
    );
    return response.data;
  },
};
