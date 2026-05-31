"use client";
import { useTheme } from "next-themes";
import { PageHeader } from "@/components/navigation/PageHeader";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTripStore, Language } from "@/store/tripStore";
import { Moon, Sun, Monitor, LogOut, Upload, Languages } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";

function SettingRow({
  icon, label, description, action,
}: {
  icon: React.ReactNode; label: string; description?: string; action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 px-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="font-medium text-base text-foreground">{label}</p>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const { t } = useT();

  const options = [
    { value: "light", icon: Sun, label: t.theme.light },
    { value: "system", icon: Monitor, label: t.theme.auto },
    { value: "dark", icon: Moon, label: t.theme.dark },
  ] as const;

  return (
    <div className="flex rounded-xl overflow-hidden border border-border">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex-1 flex flex-col items-center gap-1.5 py-3 text-sm font-medium transition-colors",
            theme === value
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-accent"
          )}
        >
          <Icon className="h-5 w-5" />
          {label}
        </button>
      ))}
    </div>
  );
}

function LanguageSelector() {
  const { language, setLanguage } = useTripStore();
  const { t } = useT();

  const options: { value: Language; flag: string; label: string; native: string }[] = [
    { value: "he", flag: "🇮🇱", label: "עברית", native: "Hebrew" },
    { value: "en", flag: "🇬🇧", label: "English", native: "English" },
    { value: "no", flag: "🇳🇴", label: "Norsk", native: "Norwegian" },
  ];

  return (
    <div className="px-4 pb-4">
      <p className="text-sm text-muted-foreground mb-3">{t.settings.chooseLanguage}</p>
      <div className="flex gap-2">
        {options.map(({ value, flag, label }) => (
          <button
            key={value}
            onClick={() => setLanguage(value)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-medium transition-all",
              language === value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-accent"
            )}
          >
            <span className="text-2xl">{flag}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useT();
  const router = useRouter();
  const { clearStore } = useTripStore();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearStore();
    router.push("/login");
  }

  return (
    <div>
      <PageHeader title={t.settings.title} />

      <div className="px-4 space-y-4 pb-8">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-3 pb-2">
            {t.settings.appearance}
          </p>
          <div className="px-4 pb-4">
            <ThemeSelector />
          </div>
        </motion.div>

        {/* Language */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-4 pt-3 pb-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t.settings.language}
            </p>
          </div>
          <LanguageSelector />
        </motion.div>

        {/* Itinerary */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-3 pb-0">
            {t.settings.itinerary}
          </p>
          <SettingRow
            icon={<Upload className="h-5 w-5 text-muted-foreground" />}
            label={t.settings.uploadNew}
            description={t.settings.uploadDesc}
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/admin">{t.settings.upload}</Link>
              </Button>
            }
          />
        </motion.div>

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-card border border-border rounded-2xl overflow-hidden"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-3 pb-0">
            {t.settings.account}
          </p>
          <SettingRow
            icon={<LogOut className="h-5 w-5 text-muted-foreground" />}
            label={t.settings.signOut}
            description={t.settings.signOutDesc}
            action={
              <Button size="sm" variant="outline" onClick={handleSignOut} className="text-destructive border-destructive/30">
                {t.settings.signOut}
              </Button>
            }
          />
        </motion.div>

        <div className="text-center pt-2 pb-4">
          <p className="text-sm text-muted-foreground">{t.settings.appName} · v1.0.0</p>
          <p className="text-sm text-muted-foreground mt-1">{t.settings.builtWith}</p>
        </div>
      </div>
    </div>
  );
}
