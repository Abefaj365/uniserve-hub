import { Link, useLocation } from "react-router-dom";
import { GraduationCap, LayoutDashboard, FileText, PlusCircle, BarChart3, Users, Building2, Settings, LogOut, ClipboardList, ShieldCheck, Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import type { UserRole } from "@/lib/mockData";

const menuItems: Record<UserRole, { label: string; icon: React.ElementType; path: string }[]> = {
  student: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/student" },
    { label: "Submit Complaint", icon: PlusCircle, path: "/student/submit" },
    { label: "My Complaints", icon: FileText, path: "/student/complaints" },
    { label: "All Complaints", icon: Globe, path: "/student/all-complaints" },
  ],
  officer: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/officer" },
    { label: "Assigned Complaints", icon: ClipboardList, path: "/officer/complaints" },
  ],
  admin: [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Approvals", icon: ShieldCheck, path: "/admin/approvals" },
    { label: "All Complaints", icon: FileText, path: "/admin/complaints" },
    { label: "Departments", icon: Building2, path: "/admin/departments" },
    { label: "Users", icon: Users, path: "/admin/users" },
    { label: "Reports", icon: BarChart3, path: "/admin/reports" },
    { label: "Settings", icon: Settings, path: "/admin/settings" },
  ],
};

export default function DashboardSidebar({ role }: { role: UserRole }) {
  const location = useLocation();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications(role);
  const items = menuItems[role];
  const roleLabel = role === "student" ? "Student" : role === "officer" ? "Department Officer" : "Administrator";

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gradient-primary">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20">
          <GraduationCap className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-display text-sm font-bold text-primary-foreground">BGCTUB</span>
      </div>

      <div className="px-5 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-primary-foreground/60">{roleLabel} Panel</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const showBadge = role === "admin" && item.path === "/admin/approvals" && unreadCount > 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/20 text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
