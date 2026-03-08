import DashboardSidebar from "./DashboardSidebar";
import type { UserRole } from "@/lib/mockData";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  role: UserRole;
  title: string;
  children: React.ReactNode;
}

export default function DashboardLayout({ role, title, children }: Props) {
  const { profile } = useAuth();
  const { notifications, unreadCount, loading, markAllRead, markOneRead } = useNotifications(role);
  const navigate = useNavigate();

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar role={role} />
      <div className="ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-8">
          <h1 className="font-display text-xl font-bold text-foreground">{title}</h1>
          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground px-0.5">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs gap-1" onClick={markAllRead}>
                      <CheckCheck className="h-3 w-3" />
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="max-h-80">
                  {loading ? (
                    <p className="text-sm text-muted-foreground text-center py-6">Loading...</p>
                  ) : notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No notifications yet.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}
                          onClick={() => {
                            if (!n.is_read) markOneRead(n.id);
                            if (n.link) navigate(n.link);
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {!n.is_read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                            <div className={!n.is_read ? "" : "ml-4"}>
                              <p className="text-sm font-medium">{n.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">
                                {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
