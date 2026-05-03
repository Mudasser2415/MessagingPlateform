import axiosInstance from "../utils/axiosInstance";

const API_URL = "/messages";

export interface ScheduleMessageData {
  clientId: string;
  templateId: string;
  groupId?: string;
  phoneNumber?: string;
  scheduledAt: string; // ISO 8601 UTC string
}

export interface ScheduledMessageDto {
  id: string;
  clientId: string;
  templateId: string;
  templateName: string;
  groupId?: string;
  groupName?: string;
  phoneNumber?: string;
  scheduledAt: string;
  status: "Scheduled" | "Processing" | "Completed" | "Failed" | "Cancelled";
  errorMessage?: string;
  createdAt: string;
  processedAt?: string;
}

export const scheduledMessageService = {
  schedule: async (data: ScheduleMessageData): Promise<string> => {
    const response = await axiosInstance.post(`${API_URL}/schedule`, data);
    return response.data as string;
  },

  getScheduled: async (clientId?: string): Promise<ScheduledMessageDto[]> => {
    const params = clientId ? { clientId } : {};
    const response = await axiosInstance.get(`${API_URL}/scheduled`, {
      params,
    });
    return response.data as ScheduledMessageDto[];
  },

  cancel: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${API_URL}/scheduled/${id}`);
  },
};
