import axiosInstance from "../utils/axiosInstance";

export interface ClientOption {
  id: string;
  name: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  partnerId?: string | null;
  partnerName?: string | null;
  partnerCompanyName?: string | null;
  groupCount: number;
  messageCount: number;
  createdAt: string;
}

const adminHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export const clientService = {
  getClients: async (): Promise<ClientOption[]> => {
    const response = await axiosInstance.get<ClientOption[]>("/Admin/clients", {
      headers: adminHeaders(),
    });
    return response.data;
  },
};
