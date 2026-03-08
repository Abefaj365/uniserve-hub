import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Mail, Hash, Building2, Calendar, FileText } from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  student_id: string | null;
  employee_id: string | null;
  department: string | null;
  approval_status: string;
  created_at: string;
  role: string;
}

interface Props {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserDetailDialog({ user: profile, open, onOpenChange }: Props) {
  const { data: complaints, isLoading } = useQuery({
    queryKey: ["user-complaints", profile?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", profile!.user_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.user_id && open,
  });

  if (!profile) return null;

  const infoItems = [
    { icon: User, label: "Full Name", value: profile.full_name },
    { icon: Mail, label: "Email", value: profile.email || "—" },
    { icon: Hash, label: profile.role === "student" ? "Student ID" : "Employee ID", value: profile.student_id || profile.employee_id || "—" },
    { icon: Building2, label: "Department", value: profile.department || "—" },
    { icon: Calendar, label: "Registered", value: new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">{profile.full_name}</span>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary" className="text-xs capitalize">{profile.role}</Badge>
                <Badge
                  variant={profile.approval_status === "approved" ? "default" : profile.approval_status === "banned" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {profile.approval_status}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Profile Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {infoItems.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <item.icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Complaints */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <FileText className="h-4 w-4" />
              Complaints ({complaints?.length ?? 0})
            </h3>
            {isLoading ? (
              <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-10 w-full" />)}</div>
            ) : complaints && complaints.length > 0 ? (
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold">ID</TableHead>
                      <TableHead className="text-xs font-semibold">Title</TableHead>
                      <TableHead className="text-xs font-semibold">Status</TableHead>
                      <TableHead className="text-xs font-semibold">Priority</TableHead>
                      <TableHead className="text-xs font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{c.complaint_id}</TableCell>
                        <TableCell className="text-sm font-medium max-w-[180px] truncate">{c.title}</TableCell>
                        <TableCell><StatusBadge status={c.status as any} /></TableCell>
                        <TableCell><PriorityBadge priority={c.priority as any} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No complaints submitted.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
