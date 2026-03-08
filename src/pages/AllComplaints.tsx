import DashboardLayout from "@/components/DashboardLayout";
import ComplaintsTable from "@/components/ComplaintsTable";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { useRealtimeComplaintUpdates } from "@/hooks/useRealtimeComplaintUpdates";

export default function AllComplaints() {
  const { user } = useAuth();
  useRealtimeComplaintUpdates();

  const { data: complaints, isLoading } = useQuery({
    queryKey: ["all-complaints"],
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

  return (
    <DashboardLayout role="student" title="All Complaints">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-foreground">University Complaints Board</h2>
          <p className="text-sm text-muted-foreground">Browse all complaints and their resolutions</p>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : complaints && complaints.length > 0 ? (
          <ComplaintsTable data={complaints} showActions />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No complaints have been submitted yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
