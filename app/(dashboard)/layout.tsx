import { BottomNav } from "@/components/navigation/BottomNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell flex flex-col bg-background">
      <main className="flex-1 overflow-y-auto overflow-x-hidden app-scroll">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
