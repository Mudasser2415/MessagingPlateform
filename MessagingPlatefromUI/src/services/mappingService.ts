import axiosInstance from "../utils/axiosInstance";

export interface MappingEmployee {
  userId: string;
  name: string;
  mobileNumber: string;
}

export interface ClientEmployeeMapping {
  clientId: string;
  clientName: string;
  employees: MappingEmployee[];
}

export interface AssignedClient {
  clientId: string;
  clientName: string;
  mobileNumber: string;
  address: string;
  location: string;
  businessType: string;
  partnerId?: string | null;
  createdAt: string;
}

export interface AssignClientEmployeesPayload {
  clientId: string;
  userIds: string[];
}

export interface AssignMultipleClientEmployeesPayload {
  clientIds: string[];
  userIds: string[];
}

export interface RemoveClientEmployeePayload {
  clientId: string;
  userId: string;
}

const adminHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export const mappingService = {
  assignEmployeesToClient: async (
    payload: AssignClientEmployeesPayload,
  ): Promise<ClientEmployeeMapping> => {
    const response = await axiosInstance.post<ClientEmployeeMapping>(
      "/client-employee-mapping",
      payload,
      { headers: adminHeaders() },
    );

    return response.data;
  },

  assignEmployeesToClients: async (
    payload: AssignMultipleClientEmployeesPayload,
  ): Promise<ClientEmployeeMapping[]> => {
    return Promise.all(
      payload.clientIds.map((clientId) =>
        mappingService.assignEmployeesToClient({
          clientId,
          userIds: payload.userIds,
        }),
      ),
    );
  },

  getMappingsByClient: async (
    clientId: string,
  ): Promise<ClientEmployeeMapping> => {
    const response = await axiosInstance.get<ClientEmployeeMapping>(
      `/client-employee-mapping/client/${clientId}`,
      { headers: adminHeaders() },
    );

    return response.data;
  },

  getAssignedClientsForEmployee: async (
    userId: string,
  ): Promise<AssignedClient[]> => {
    const response = await axiosInstance.get<AssignedClient[]>(
      `/client-employee-mapping/employee/${userId}`,
    );

    return response.data;
  },

  removeMapping: async (
    payload: RemoveClientEmployeePayload,
  ): Promise<void> => {
    await axiosInstance.delete("/client-employee-mapping", {
      data: payload,
      headers: adminHeaders(),
    });
  },
};
