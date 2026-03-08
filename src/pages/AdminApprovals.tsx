import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { markAllRead } = useNotifications("admin");

  // Mark notifications as read when visiting this page
  useEffect(() => {
    markAllRead();
  }, []);

  const { data: pendingUsers, isLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("approval_status", "pending")
        .neq("user_id", user!.id);
      if (error) throw error;
      // Fetch roles
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase.from("user_roles").select("*").in("user_id", userIds);
      return profiles.map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role ?? "student",
      }));
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: status } as any)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      toast({
        title: status === "approved" ? "Student Approved" : "Student Rejected",
        description: status === "approved"
          ? "The student can now log in and use the system."
          : "The student registration has been rejected.",
      });
    },
  });

  return (
    <DashboardLayout role="admin" title="User Approvals">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Clock className="h-4 w-4" />
          <span>Users below are waiting for your approval to access the system.</span>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : !pendingUsers?.length ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500" />
            <p className="font-medium">No pending approvals</p>
            <p className="text-sm mt-1">All registrations have been reviewed.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                 <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Registered</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{u.student_id || u.employee_id || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.department || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="h-8 gap-1"
                          onClick={() => updateStatus.mutate({ userId: u.user_id, status: "approved" })}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 gap-1"
                          onClick={() => updateStatus.mutate({ userId: u.user_id, status: "rejected" })}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
