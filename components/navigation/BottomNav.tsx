"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Map, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useT();

  const NAV_ITEMS = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/days", label: t.nav.itinerary, icon: CalendarDays },
    { href: "/map", label: t.nav.map, icon: Map },
    { href: "/settings", label: t.nav.settings, icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom bottom-nav-fixed">
      <div className="mx-auto max-w-lg">
        <div className="bg-background/95 border-t border-border px-2 pt-2 pb-3">
          <div className="flex items-center justify-around">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-colors min-tap",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="relative">
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 -m-2 bg-primary/10 rounded-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <Icon
                      className={cn("h-6 w-6 relative z-10 transition-transform", isActive && "scale-110")}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </div>
                  <span className={cn("text-xs font-medium", isActive && "font-semibold")}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
