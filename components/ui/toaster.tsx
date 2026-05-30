"use client";
import { useToast } from "@/hooks/useToast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 rounded-2xl p-4 shadow-lg border animate-slideUp
            ${toast.variant === "destructive"
              ? "bg-destructive text-destructive-foreground border-destructive/20"
              : "bg-card text-card-foreground border-border"
            }`}
        >
          <div className="flex-1 min-w-0">
            {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
            {toast.description && <p className="text-xs opacity-80 mt-0.5">{toast.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
