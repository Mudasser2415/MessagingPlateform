import axiosInstance from "../utils/axiosInstance";
import type { AuthResponse } from "../types/auth";
import { normalizeIndianMobileNumber } from "../utils/mobileValidation";

export const authService = {
  login: async (
    mobileNumber: string,
    password: string,
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.post<{
      token: string;
      userId: string;
      partnerId?: string | null;
      role: string;
      name: string;
      mobileNumber: string;
      canCreatePartners?: boolean;
    }>("/Auth/login", {
      mobileNumber: normalizeIndianMobileNumber(mobileNumber),
      password: password,
    });

    return {
      token: response.data.token,
      userId: response.data.userId,
      partnerId: response.data.partnerId,
      role: response.data.role,
      name: response.data.name,
      mobileNumber: response.data.mobileNumber,
      canCreatePartners: response.data.canCreatePartners,
      user: {
        id: response.data.userId,
        name: response.data.name,
        mobileNumber: response.data.mobileNumber,
        emailId: "",
        role: response.data.role,
        canCreatePartners: response.data.canCreatePartners,
        partnerId: response.data.partnerId,
      },
    };
  },

  register: async (data: any): Promise<any> => {
    const response = await axiosInstance.post("/Clients", {
      ...data,
      mobileNumber: normalizeIndianMobileNumber(
        String(data.mobileNumber ?? ""),
      ),
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
