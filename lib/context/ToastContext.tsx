// lib/context/ToastContext.tsx
"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import { toast, ToastOptions } from "react-toastify";

interface ToastContextType {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const success = useCallback((message: string, options?: ToastOptions) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  const error = useCallback((message: string, options?: ToastOptions) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options,
    });
  }, []);

  return (
    <ToastContext.Provider value={{ success, error }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
