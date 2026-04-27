export interface User {
  id: string;
  name: string;
  mobileNumber: string;
  emailId: string;
  role: string;
  canCreatePartners?: boolean;
  partnerId?: string | null;
  address?: string;
  location?: string;
  businessType?: string;
}

export interface AuthResponse {
  userId: string;
  partnerId?: string | null;
  role: string;
  name: string;
  mobileNumber: string;
  canCreatePartners?: boolean;
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
