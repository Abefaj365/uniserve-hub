import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Calendar, User, Building2, Tag, AlertTriangle, Clock, Paperclip } from "lucide-react";

interface Complaint {
  id: string;
  complaint_id: string;
  title: string;
  description: string;
  category: string;
  department_name: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  student_name: string;
  student_id_number: string | null;
  user_id: string;
}

interface Props {
  complaint: Complaint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ComplaintDetailDialog({ complaint, open, onOpenChange }: Props) {
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["complaint-history", complaint?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaint_status_history")
        .select("*")
        .eq("complaint_id", complaint!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!complaint?.id && open,
  });

  const { data: attachments } = useQuery({
    queryKey: ["complaint-attachments", complaint?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("complaint_id", complaint!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!complaint?.id && open,
  });

  const { data: studentProfile } = useQuery({
    queryKey: ["student-profile", complaint?.user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", complaint!.user_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!complaint?.user_id && open,
  });

  if (!complaint) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="block">{complaint.title}</span>
              <span className="text-xs font-mono text-muted-foreground">{complaint.complaint_id}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Status & Priority */}
          <div className="flex flex-wrap gap-3">
            <StatusBadge status={complaint.status as any} />
            <PriorityBadge priority={complaint.priority as any} />
          </div>

          {/* Complaint Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Student</p>
                <p className="text-sm font-medium">{complaint.student_name}</p>
                {complaint.student_id_number && (
                  <p className="text-xs text-muted-foreground font-mono">{complaint.student_id_number}</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Department</p>
                <p className="text-sm font-medium">{complaint.department_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Tag className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium">{complaint.category}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Submitted</p>
                <p className="text-sm font-medium">{new Date(complaint.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
            </div>
          </div>

          {/* Student Contact */}
          {studentProfile && (
            <>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground mb-1">Student Email</p>
                <p className="text-sm font-medium">{studentProfile.email || "—"}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Description</h3>
            <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </div>
          </div>

          {/* Attachments */}
          {attachments && attachments.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({attachments.length})
                </h3>
                <div className="space-y-2">
                  {attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm hover:bg-muted/50 transition-colors"
                    >
                      <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{a.file_name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{a.file_type}</span>
                    </a>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Status History */}
          <Separator />
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Clock className="h-4 w-4" />
              Status History
            </h3>
            {historyLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : history && history.length > 0 ? (
              <div className="space-y-2">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                    <div className="flex-1">
                      <span className="text-muted-foreground">{h.old_status ?? "New"}</span>
                      <span className="mx-2">→</span>
                      <span className="font-medium">{h.new_status}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-3">No status changes yet.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
