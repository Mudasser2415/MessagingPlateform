import axiosInstance from "../utils/axiosInstance";

export interface PartnerClient {
  id: string;
  partnerId: string;
  name: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  emailId: string;
  availableCredits: number;
  createdAt: string;
}

export const partnerClientService = {
  getClients: async (search?: string): Promise<PartnerClient[]> => {
    const searchParams = new URLSearchParams();

    if (search) {
      searchParams.append("search", search);
    }

    const response = await axiosInstance.get<PartnerClient[]>(
      `/partner/clients?${searchParams.toString()}`,
    );

    return response.data;
  },
};
