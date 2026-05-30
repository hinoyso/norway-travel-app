import { BottomNav } from "@/components/navigation/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-lg mx-auto pb-nav">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
