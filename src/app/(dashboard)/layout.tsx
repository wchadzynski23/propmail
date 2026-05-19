import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background bg-brushed-metal">
        <div className="absolute inset-0 pointer-events-none bg-grain" />
        {children}
      </main>
    </div>
  );
}
