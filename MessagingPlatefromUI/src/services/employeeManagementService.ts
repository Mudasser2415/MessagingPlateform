import axiosInstance from "../utils/axiosInstance";
import { normalizeIndianMobileNumber } from "../utils/mobileValidation";

export interface EmployeeClientRecord {
  id: string;
  partnerId?: string | null;
  name: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  availableCredits: number;
  createdAt: string;
}

export interface EmployeePartnerRecord {
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

export interface CreateEmployeeClientRequest {
  name: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  partnerId?: string | null;
}

export interface CreateEmployeePartnerRequest {
  name: string;
  mobileNumber: string;
  email: string | null;
  password: string;
  companyName: string;
  location: string;
}

export const employeeManagementService = {
  getClients: async (): Promise<EmployeeClientRecord[]> => {
    const response =
      await axiosInstance.get<EmployeeClientRecord[]>("/clients");
    return response.data;
  },

  createClient: async (
    payload: CreateEmployeeClientRequest,
  ): Promise<string> => {
    const response = await axiosInstance.post<string>("/clients", {
      ...payload,
      mobileNumber: normalizeIndianMobileNumber(payload.mobileNumber),
      partnerId: payload.partnerId || null,
    });

    return response.data;
  },

  getPartners: async (): Promise<EmployeePartnerRecord[]> => {
    const response =
      await axiosInstance.get<EmployeePartnerRecord[]>("/partners");
    return response.data;
  },

  createPartner: async (
    payload: CreateEmployeePartnerRequest,
  ): Promise<EmployeePartnerRecord> => {
    const response = await axiosInstance.post<EmployeePartnerRecord>(
      "/partners",
      {
        ...payload,
        mobileNumber: normalizeIndianMobileNumber(payload.mobileNumber),
        location: payload.location,
      },
    );

    return response.data;
  },
};
