import DashboardLayout from "@/components/DashboardLayout";
import ComplaintsTable from "@/components/ComplaintsTable";
import { complaints } from "@/lib/mockData";

export default function OfficerComplaints() {
  return (
    <DashboardLayout role="officer" title="Assigned Complaints">
      <div className="space-y-6 animate-fade-in">
        <ComplaintsTable data={complaints} />
      </div>
    </DashboardLayout>
  );
}