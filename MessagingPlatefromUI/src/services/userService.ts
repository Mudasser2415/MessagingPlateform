import axiosInstance from "../utils/axiosInstance";

export interface EmployeeOption {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const adminHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
});

export const userService = {
  getEmployees: async (): Promise<EmployeeOption[]> => {
    const response = await axiosInstance.get<EmployeeOption[]>(
      "/user-auth/users?role=Employee",
      { headers: adminHeaders() },
    );

    return response.data.filter((employee) => employee.isActive);
  },
};
