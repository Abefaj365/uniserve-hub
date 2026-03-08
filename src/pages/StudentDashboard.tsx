import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ComplaintsTable from "@/components/ComplaintsTable";
import { complaints } from "@/lib/mockData";
import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

const myComplaints = complaints.slice(0, 3);

export default function StudentDashboard() {
  return (
    <DashboardLayout role="student" title="Student Dashboard">
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Welcome back, Tanvir Ahmed</h2>
          <p className="text-sm text-muted-foreground">Here's an overview of your complaints</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total Submitted" value={3} icon={FileText} colorClass="bg-primary/10 text-primary" />
          <StatsCard title="Pending" value={1} icon={Clock} colorClass="bg-warning/10 text-warning" />
          <StatsCard title="In Progress" value={1} icon={AlertCircle} colorClass="bg-info/10 text-info" />
          <StatsCard title="Resolved" value={1} icon={CheckCircle} colorClass="bg-success/10 text-success" />
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Recent Complaints</h3>
          <ComplaintsTable data={myComplaints} />
        </div>
      </div>
    </DashboardLayout>
  );
}