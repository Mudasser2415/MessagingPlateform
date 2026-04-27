import { create } from "zustand";

export interface AdminUser {
  adminId: string;
  email: string;
  fullName: string;
  role: string;
}

const isPrivilegedAdminRole = (role?: string | null) =>
  role === "Admin" || role === "SuperAdmin";

interface AdminAuthState {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (admin: AdminUser, token: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => {
  // Initialize from localStorage
  const storedAdmin = localStorage.getItem("adminUser");
  const storedToken = localStorage.getItem("adminToken");
  const parsedAdmin = storedAdmin
    ? (JSON.parse(storedAdmin) as AdminUser)
    : null;
  const hasAdminAccess =
    Boolean(storedToken) && isPrivilegedAdminRole(parsedAdmin?.role);

  if (storedToken && !hasAdminAccess) {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
  }

  return {
    admin: hasAdminAccess ? parsedAdmin : null,
    token: hasAdminAccess ? storedToken : null,
    isAuthenticated: hasAdminAccess,

    setAuth: (admin: AdminUser, token: string) => {
      const hasAccess = isPrivilegedAdminRole(admin.role);

      if (!hasAccess) {
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminToken");
        set({ admin: null, token: null, isAuthenticated: false });
        return;
      }

      localStorage.setItem("adminUser", JSON.stringify(admin));
      localStorage.setItem("adminToken", token);
      set({ admin, token, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
      set({ admin: null, token: null, isAuthenticated: false });
    },

    clearAuth: () => {
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
      set({ admin: null, token: null, isAuthenticated: false });
    },
  };
});
