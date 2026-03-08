import DashboardLayout from "@/components/DashboardLayout";
import ComplaintsTable from "@/components/ComplaintsTable";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function OfficerComplaints() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: complaints, isLoading, refetch } = useQuery({
    queryKey: ["officer-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });
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
    <DashboardLayout role="officer" title="Assigned Complaints">
      <div className="space-y-6 animate-fade-in">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : complaints && complaints.length > 0 ? (
          <ComplaintsTable data={complaints} onStatusChange={handleStatusChange} showActions />
        ) : (
          <div className="text-center py-12 text-muted-foreground">No assigned complaints.</div>
        )}
      </div>
    </DashboardLayout>
  );
}
