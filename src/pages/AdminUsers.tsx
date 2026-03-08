import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsers() {
  const { user } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      // Get roles for each user
      const userIds = profiles.map(p => p.user_id);
      const { data: roles } = await supabase.from("user_roles").select("*").in("user_id", userIds);
      return profiles.map(p => ({
        ...p,
        role: roles?.find(r => r.user_id === p.user_id)?.role ?? "student",
      }));
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout role="admin" title="Manage Users">
      <div className="space-y-6 animate-fade-in">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Student ID</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{u.student_id || u.employee_id || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.department || "—"}</TableCell>
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
