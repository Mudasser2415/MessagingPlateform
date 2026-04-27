import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  selectedClientId: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setSelectedClientId: (clientId: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  selectedClientId: localStorage.getItem("selectedClientId"),
  isAuthenticated: !!localStorage.getItem("token"),
  setAuth: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    localStorage.removeItem("selectedClientId");
    set({ user, token, selectedClientId: null, isAuthenticated: true });
  },
  setSelectedClientId: (clientId) => {
    if (clientId) {
      localStorage.setItem("selectedClientId", clientId);
    } else {
      localStorage.removeItem("selectedClientId");
    }

    set({ selectedClientId: clientId });
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("selectedClientId");
    set({
      user: null,
      token: null,
      selectedClientId: null,
      isAuthenticated: false,
    });
  },
}));
