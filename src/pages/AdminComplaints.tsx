import DashboardLayout from "@/components/DashboardLayout";
import ComplaintsTable from "@/components/ComplaintsTable";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AdminComplaints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: complaints, isLoading, refetch } = useQuery({
    queryKey: ["admin-complaints", statusFilter],
    queryFn: async () => {
      let query = supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleStatusChange = async (complaintId: string, newStatus: string, note?: string) => {
    const complaint = complaints?.find(c => c.id === complaintId);
    const { error } = await supabase.from("complaints").update({ status: newStatus as any }).eq("id", complaintId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("complaint_status_history").insert({
      complaint_id: complaintId,
      old_status: complaint?.status as any,
      new_status: newStatus as any,
      changed_by: user!.id,
      note: note || null,
    });
    toast({ title: "Status Updated" });
    refetch();
  };

  return (
    <DashboardLayout role="admin" title="All Complaints">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : complaints && complaints.length > 0 ? (
          <ComplaintsTable data={complaints} onStatusChange={handleStatusChange} showActions />
        ) : (
          <div className="text-center py-12 text-muted-foreground">No complaints found.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
