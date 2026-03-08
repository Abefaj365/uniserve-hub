import DashboardLayout from "@/components/DashboardLayout";
import ComplaintsTable from "@/components/ComplaintsTable";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentComplaints() {
  const { user } = useAuth();

  const { data: complaints, isLoading } = useQuery({
    queryKey: ["my-complaints", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <DashboardLayout role="student" title="My Complaints">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-foreground">All Your Complaints</h2>
          <p className="text-sm text-muted-foreground">Track the status of all your submitted complaints</p>
        </div>
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : complaints && complaints.length > 0 ? (
          <ComplaintsTable data={complaints} showActions />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>You haven't submitted any complaints yet.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
