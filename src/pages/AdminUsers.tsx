import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Ban, Trash2, ShieldCheck, Eye } from "lucide-react";
import UserDetailDialog from "@/components/UserDetailDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase.from("user_roles").select("*").in("user_id", userIds);
      return profiles.map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role ?? "student",
      }));
    },
    enabled: !!user,
  });

  const banUser = useMutation({
    mutationFn: async ({ userId, currentStatus }: { userId: string; currentStatus: string }) => {
      const newStatus = currentStatus === "banned" ? "approved" : "banned";
      const { error } = await supabase
        .from("profiles")
        .update({ approval_status: newStatus } as any)
        .eq("user_id", userId);
      if (error) throw error;
      return newStatus;
    },
    onSuccess: (newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({
        title: newStatus === "banned" ? "User Banned" : "User Unbanned",
        description: newStatus === "banned"
          ? "The user has been banned and can no longer log in."
          : "The user has been unbanned and can log in again.",
      });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Delete profile (cascade will handle related data)
      const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
      if (error) throw error;
      // Delete role
      await supabase.from("user_roles").delete().eq("user_id", userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User Deleted", description: "The user account has been removed from the system." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const currentAdminId = user?.id;
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return (
    <>
    <DashboardLayout role="admin" title="Manage Users">
      <div className="space-y-6 animate-fade-in">
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => {
                  const isSelf = u.user_id === currentAdminId;
                  const isBanned = u.approval_status === "banned";
                  return (
                    <TableRow key={u.id} className={isBanned ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{u.full_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{u.student_id || u.employee_id || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isBanned ? "destructive" : u.approval_status === "approved" ? "default" : "secondary"}>
                          {u.approval_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.department || "—"}</TableCell>
                      <TableCell>
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">You</span>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 gap-1"
                              onClick={() => setSelectedUser(u)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant={isBanned ? "outline" : "secondary"}
                              className="h-8 gap-1"
                              onClick={() => banUser.mutate({ userId: u.user_id, currentStatus: u.approval_status })}
                              disabled={banUser.isPending}
                            >
                              {isBanned ? <ShieldCheck className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                              {isBanned ? "Unban" : "Ban"}
                            </Button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive" className="h-8 gap-1">
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete <strong>{u.full_name}</strong>'s account? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser.mutate(u.user_id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
    <UserDetailDialog
      user={selectedUser}
      open={!!selectedUser}
      onOpenChange={(open) => { if (!open) setSelectedUser(null); }}
    />
    </>
  );
}
