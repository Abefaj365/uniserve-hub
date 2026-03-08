import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { CheckCircle, XCircle, Clock, Trash2 } from "lucide-react";
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

export default function AdminApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { markAllRead } = useNotifications("admin");

  useEffect(() => {
    markAllRead();
  }, []);

  const { data: pendingUsers, isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("approval_status", "pending")
        .neq("user_id", user!.id);
      if (error) throw error;
      const userIds = profiles.map(p => p.user_id);
      if (userIds.length === 0) return [];
      const { data: roles } = await supabase.from("user_roles").select("*").in("user_id", userIds);
      return profiles.map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role ?? "student",
      }));
    },
    enabled: !!user,
  });

  const { data: rejectedUsers, isLoading: rejectedLoading } = useQuery({
    queryKey: ["rejected-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("approval_status", "rejected");
      if (error) throw error;
      return profiles;
    },
    enabled: !!user,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      if (status === "rejected") {
        const { data, error } = await supabase.functions.invoke("delete-rejected-user", {
          body: { userId },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
      } else {
        const { error } = await supabase
          .from("profiles")
          .update({ approval_status: status } as any)
          .eq("user_id", userId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["rejected-users"] });
      toast({
        title: status === "approved" ? "User Approved" : "User Rejected",
        description: status === "approved"
          ? "The user can now log in and use the system."
          : "The registration has been rejected. They can register again.",
      });
    },
  });

  const deleteRejectedProfile = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rejected-users"] });
      toast({ title: "Record Deleted", description: "The rejected user record has been permanently removed." });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const renderTable = (data: any[] | undefined, isLoading: boolean, type: "pending" | "rejected") => {
    if (isLoading) {
      return <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>;
    }

    if (!data?.length) {
      const emptyConfig = type === "pending"
        ? { icon: CheckCircle, color: "text-green-500", title: "No pending approvals", desc: "All registrations have been reviewed." }
        : { icon: XCircle, color: "text-muted-foreground", title: "No rejected users", desc: "No registrations have been rejected." };
      return (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          <emptyConfig.icon className={`h-10 w-10 mx-auto mb-3 ${emptyConfig.color}`} />
          <p className="font-medium">{emptyConfig.title}</p>
          <p className="text-sm mt-1">{emptyConfig.desc}</p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              {type === "pending" && <TableHead className="font-semibold">Role</TableHead>}
              <TableHead className="font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">{type === "pending" ? "Registered" : "Rejected"}</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                {type === "pending" && (
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">{u.role}</Badge>
                  </TableCell>
                )}
                <TableCell className="font-mono text-xs text-muted-foreground">{u.student_id || u.employee_id || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{u.department || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(u.updated_at || u.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {type === "pending" ? (
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
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="h-8 gap-1">
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete Record
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Rejected Record</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete <strong>{u.full_name}</strong>'s rejected record? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRejectedProfile.mutate(u.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <DashboardLayout role="admin" title="User Approvals">
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending
              {pendingUsers?.length ? (
                <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">{pendingUsers.length}</Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected
              {rejectedUsers?.length ? (
                <Badge variant="destructive" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">{rejectedUsers.length}</Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Users below are waiting for your approval to access the system.
            </p>
            {renderTable(pendingUsers, pendingLoading, "pending")}
          </TabsContent>
          <TabsContent value="rejected">
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              These users were rejected. Their auth accounts have been removed so they can re-register.
            </p>
            {renderTable(rejectedUsers, rejectedLoading, "rejected")}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
