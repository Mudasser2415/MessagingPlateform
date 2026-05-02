import axiosInstance from "../utils/axiosInstance";
import { normalizeIndianMobileNumber } from "../utils/mobileValidation";

const API_URL = "/messages";

export interface CreateMessageData {
  clientId: string;
  templateId: string;
  groupId?: string;
  phoneNumber?: string;
  messageContent: string;
}

export interface SendGroupMessageData {
  clientId: string;
  templateId: string;
  groupId: string;
}

export const messageService = {
  getRecentMessages: async (count = 10) => {
    const response = await axiosInstance.get(
      `${API_URL}/recent?count=${count}`,
    );
    return response.data;
  },

  getMessages: async () => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  createMessage: async (data: CreateMessageData) => {
    const response = await axiosInstance.post(API_URL, {
      ...data,
      phoneNumber: data.phoneNumber
        ? normalizeIndianMobileNumber(data.phoneNumber)
        : data.phoneNumber,
    });
    return response.data;
  },

  sendGroupMessage: async (data: SendGroupMessageData) => {
    const response = await axiosInstance.post(`${API_URL}/send-group`, data);
    return response.data as { totalMessages: number; status: string };
  },
};
