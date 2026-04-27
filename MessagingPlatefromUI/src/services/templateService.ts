import axiosInstance from '../utils/axiosInstance';

export interface CreateTemplateData {
  templateName: string;
  templateContent: string;
  category: string;
  templateType: string;
  clientId: string;
}

export interface UpdateTemplateData {
  templateId: string;
  templateName: string;
  templateContent: string;
  category: string;
  templateType: string;
}

export const templateService = {
  createTemplate: async (data: CreateTemplateData) => {
    const response = await axiosInstance.post('/Templates', data);
    return response.data;
  },
  
  getTemplates: async () => {
    const response = await axiosInstance.get('/Templates');
    return response.data;
  },

  getTemplateById: async (id: string) => {
    const response = await axiosInstance.get(`/Templates/${id}`);
    return response.data;
  },

  updateTemplate: async (id: string, data: UpdateTemplateData) => {
    const response = await axiosInstance.put(`/Templates/${id}`, data);
    return response.data;
  }
};
