import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";
import ComplaintsTable from "@/components/ComplaintsTable";
import { complaints } from "@/lib/mockData";
import { ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react";

export default function OfficerDashboard() {
  return (
    <DashboardLayout role="officer" title="Department Dashboard">
      <div className="space-y-8 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Hostel Management Department</h2>
          <p className="text-sm text-muted-foreground">Manage and resolve assigned complaints</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Assigned" value={12} icon={ClipboardList} colorClass="bg-primary/10 text-primary" />
          <StatsCard title="Pending" value={5} icon={Clock} colorClass="bg-warning/10 text-warning" />
          <StatsCard title="In Progress" value={4} icon={AlertTriangle} colorClass="bg-info/10 text-info" />
          <StatsCard title="Resolved" value={3} icon={CheckCircle} colorClass="bg-success/10 text-success" />
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Assigned Complaints</h3>
          <ComplaintsTable data={complaints} />
        </div>
      </div>
    </DashboardLayout>
  );
}