import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ComplaintsTable from "@/components/ComplaintsTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { complaints, departments, statsData } from "@/lib/mockData";
import { FileText, Clock, CheckCircle, AlertTriangle, Users, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const barData = [
  { name: "Hostel", count: 12 },
  { name: "Lab", count: 8 },
  { name: "Exam", count: 15 },
  { name: "Transport", count: 6 },
  { name: "Facilities", count: 10 },
];

const pieData = [
  { name: "Pending", value: 18, color: "hsl(38 92% 50%)" },
  { name: "In Progress", value: 15, color: "hsl(199 89% 48%)" },
  { name: "Resolved", value: 14, color: "hsl(142 71% 45%)" },
  { name: "Closed", value: 4, color: "hsl(210 10% 45%)" },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin" title="Admin Dashboard">
      <div className="space-y-8 animate-fade-in">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <StatsCard title="Total Complaints" value={statsData.total} icon={FileText} colorClass="bg-primary/10 text-primary" />
          <StatsCard title="Pending" value={statsData.pending} icon={Clock} colorClass="bg-warning/10 text-warning" />
          <StatsCard title="In Progress" value={statsData.inProgress} icon={AlertTriangle} colorClass="bg-info/10 text-info" />
          <StatsCard title="Resolved" value={statsData.resolved} icon={CheckCircle} colorClass="bg-success/10 text-success" />
          <StatsCard title="Departments" value={5} icon={Building2} colorClass="bg-accent/10 text-accent" />
          <StatsCard title="Students" value={128} icon={Users} colorClass="bg-primary/10 text-primary" />
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
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Complaints</h3>
          <ComplaintsTable data={complaints} />
        </div>
      </div>
    </DashboardLayout>
  );
}