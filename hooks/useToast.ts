"use client";
import { useState, useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

let toastFn: ((toast: Omit<Toast, "id">) => void) | null = null;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((newToast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const duration = newToast.duration ?? 3000;
    setToasts((prev) => [...prev, { ...newToast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  return { toasts, toast };
}

export function toast(t: Omit<Toast, "id">) {
  toastFn?.(t);
}
