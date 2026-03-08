import DashboardLayout from "@/components/DashboardLayout";
import ComplaintsTable from "@/components/ComplaintsTable";
import { complaints } from "@/lib/mockData";

export default function AdminComplaints() {
  return (
    <DashboardLayout role="admin" title="All Complaints">
      <div className="space-y-6 animate-fade-in">
        <ComplaintsTable data={complaints} />
      </div>
    </DashboardLayout>
  );
}