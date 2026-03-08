import DashboardLayout from "@/components/DashboardLayout";
import ComplaintsTable from "@/components/ComplaintsTable";
import { complaints } from "@/lib/mockData";

export default function StudentComplaints() {
  return (
    <DashboardLayout role="student" title="My Complaints">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-lg font-semibold text-foreground">All Your Complaints</h2>
          <p className="text-sm text-muted-foreground">Track the status of all your submitted complaints</p>
        </div>
        <ComplaintsTable data={complaints.slice(0, 3)} />
      </div>
    </DashboardLayout>
  );
}