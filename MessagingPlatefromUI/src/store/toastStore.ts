import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface ToastRecord {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: ToastRecord[];
  addToast: (message: string, tone?: ToastTone) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, tone = "info") => {
    const id = crypto.randomUUID();

    set((state) => ({
      toasts: [...state.toasts, { id, message, tone }],
    }));

    window.setTimeout(() => {
      get().removeToast(id);
    }, 3500);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
