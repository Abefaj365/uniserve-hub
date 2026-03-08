import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ComplaintsTable from "@/components/ComplaintsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { FileText, Clock, CheckCircle, AlertTriangle, Users, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: complaints, isLoading } = useQuery({
    queryKey: ["admin-all-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase.from("complaints").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: userCount } = useQuery({
    queryKey: ["admin-user-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const total = complaints?.length ?? 0;
  const pending = complaints?.filter(c => c.status === "Pending").length ?? 0;
  const inProgress = complaints?.filter(c => c.status === "In Progress").length ?? 0;
  const resolved = complaints?.filter(c => c.status === "Resolved").length ?? 0;

  const barData = departments?.map(d => ({
    name: d.name.split(" ")[0],
    count: complaints?.filter(c => c.department_name === d.name).length ?? 0,
  })) ?? [];

  const pieData = [
    { name: "Pending", value: pending, color: "hsl(38 92% 50%)" },
    { name: "In Progress", value: inProgress, color: "hsl(199 89% 48%)" },
    { name: "Resolved", value: resolved, color: "hsl(142 71% 45%)" },
    { name: "Closed", value: complaints?.filter(c => c.status === "Closed").length ?? 0, color: "hsl(210 10% 45%)" },
  ];

  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      <div className="space-y-8 animate-fade-in">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <StatsCard title="Total Complaints" value={total} icon={FileText} colorClass="bg-primary/10 text-primary" />
          <StatsCard title="Pending" value={pending} icon={Clock} colorClass="bg-warning/10 text-warning" />
          <StatsCard title="In Progress" value={inProgress} icon={AlertTriangle} colorClass="bg-info/10 text-info" />
          <StatsCard title="Resolved" value={resolved} icon={CheckCircle} colorClass="bg-success/10 text-success" />
          <StatsCard title="Departments" value={departments?.length ?? 0} icon={Building2} colorClass="bg-accent/10 text-accent" />
          <StatsCard title="Students" value={total} icon={Users} colorClass="bg-primary/10 text-primary" />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="font-display text-base">Complaints by Department</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(162 63% 30%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle className="font-display text-base">Status Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={2}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                    <span className="font-semibold text-foreground">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Complaints</h3>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : complaints && complaints.length > 0 ? (
            <ComplaintsTable data={complaints.slice(0, 10)} showActions />
          ) : (
            <div className="text-center py-8 text-muted-foreground">No complaints yet.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
