import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ComplaintsTable from "@/components/ComplaintsTable";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function OfficerDashboard() {
  const { user } = useAuth();

  const { data: complaints, isLoading } = useQuery({
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

  const total = complaints?.length ?? 0;
  const pending = complaints?.filter(c => c.status === "Pending").length ?? 0;
  const inProgress = complaints?.filter(c => c.status === "In Progress").length ?? 0;
  const resolved = complaints?.filter(c => c.status === "Resolved").length ?? 0;

  return (
    <DashboardLayout role="officer" title="Department Dashboard">
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Department Officer Dashboard</h2>
          <p className="text-sm text-muted-foreground">Manage and resolve assigned complaints</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Assigned" value={total} icon={ClipboardList} colorClass="bg-primary/10 text-primary" />
          <StatsCard title="Pending" value={pending} icon={Clock} colorClass="bg-warning/10 text-warning" />
          <StatsCard title="In Progress" value={inProgress} icon={AlertTriangle} colorClass="bg-info/10 text-info" />
          <StatsCard title="Resolved" value={resolved} icon={CheckCircle} colorClass="bg-success/10 text-success" />
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Complaints</h3>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : complaints && complaints.length > 0 ? (
            <ComplaintsTable data={complaints.slice(0, 5)} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">No complaints assigned.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
