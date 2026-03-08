import DashboardSidebar from "./DashboardSidebar";
import type { UserRole } from "@/lib/mockData";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  role: UserRole;
  title: string;
  children: React.ReactNode;
}

export default function DashboardLayout({ role, title, children }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar role={role} />
      <div className="ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-8">
          <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">3</span>
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">U</div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}