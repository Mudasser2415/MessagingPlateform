import axiosInstance from "../utils/axiosInstance";
import {
  normalizeIndianMobileNumber,
  normalizeMobileCollection,
} from "../utils/mobileValidation";

export interface CreateGroupData {
  groupName: string;
  clientId: string;
  phoneNumbers?: string[];
}

export interface UpdateGroupData {
  groupName: string;
}

export interface UpdateGroupMembersData {
  phoneNumbers: string[];
}

export interface GroupDto {
  groupId: string;
  groupName: string;
  clientId: string;
  createdAt: string;
  memberCount: number;
}

export interface GroupMemberDto {
  id: string;
  groupId: string;
  phoneNumber: string;
  isKnownContact: boolean;
}

export interface GroupMembersPageResponse {
  items: GroupMemberDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetGroupMembersParams {
  searchTerm?: string;
  isKnownContact?: boolean;
  page?: number;
  pageSize?: number;
}

export interface UpdateGroupMemberKnownContactData {
  isKnownContact: boolean;
}

export const groupService = {
  getGroups: async (): Promise<GroupDto[]> => {
    const response = await axiosInstance.get("/groups");
    return response.data;
  },

  createGroup: async (data: CreateGroupData): Promise<string> => {
    const response = await axiosInstance.post("/Groups", {
      ...data,
      phoneNumbers: data.phoneNumbers
        ? normalizeMobileCollection(data.phoneNumbers)
        : data.phoneNumbers,
    });
    return response.data;
  },

  createGroupWithBulkPhones: async (
    groupName: string,
    clientId: string,
    phoneNumbers: string[],
  ): Promise<string> => {
    const response = await axiosInstance.post("/Groups", {
      groupName,
      clientId,
      phoneNumbers: normalizeMobileCollection(phoneNumbers),
    });
    return response.data;
  },

  updateGroup: async (id: string, data: UpdateGroupData): Promise<void> => {
    await axiosInstance.put(`/groups/${id}`, data);
  },

  updateGroupMembers: async (
    id: string,
    phoneNumbers: string[],
  ): Promise<void> => {
    await axiosInstance.put(`/groups/${id}/members`, {
      phoneNumbers: normalizeMobileCollection(phoneNumbers),
    });
  },

  deleteGroup: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/groups/${id}`);
  },

  getGroupMembersPage: async (
    id: string,
    params: GetGroupMembersParams = {},
  ): Promise<GroupMembersPageResponse> => {
    const response = await axiosInstance.get(`/groups/${id}/members`, {
      params: {
        searchTerm: params.searchTerm?.trim() || undefined,
        isKnownContact: params.isKnownContact,
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
      },
    });

    return response.data;
  },

  getGroupMembers: async (id: string): Promise<GroupMemberDto[]> => {
    const members: GroupMemberDto[] = [];
    let page = 1;
    let totalPages = 0;

    do {
      const response = await groupService.getGroupMembersPage(id, {
        page,
        pageSize: 100,
      });

      members.push(...response.items);
      totalPages = response.totalPages;
      page += 1;
    } while (page <= totalPages);

    return members;
  },

  addGroupMembers: async (
    groupId: string,
    phoneNumbers: string[],
  ): Promise<void> => {
    await axiosInstance.post(`/groups/${groupId}/members`, {
      phoneNumbers: normalizeMobileCollection(phoneNumbers),
    });
  },

  toggleKnownContact: async (
    id: string,
    data: UpdateGroupMemberKnownContactData,
  ): Promise<GroupMemberDto> => {
    const response = await axiosInstance.put(
      `/group-members/${id}/toggle-known`,
      data,
    );
    return response.data;
  },

  addGroupMember: async (
    groupId: string,
    phoneNumber: string,
  ): Promise<string> => {
    const response = await axiosInstance.post("/GroupMembers", {
      groupId,
      phoneNumber: normalizeIndianMobileNumber(phoneNumber),
    });
    return response.data;
  },

  deleteGroupMember: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/group-members/${id}`);
  },
};
