"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  className?: string;
  transparent?: boolean;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
  className,
  transparent = false,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 safe-top",
        transparent ? "bg-transparent" : "glass border-b border-border/50",
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center h-10 w-10 rounded-xl hover:bg-accent active:scale-95 transition-all min-tap"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-lg leading-tight truncate">{title}</h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {rightAction && <div className="shrink-0">{rightAction}</div>}
      </div>
    </header>
  );
}
