import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { departments } from "@/lib/mockData";
import { Building2 } from "lucide-react";

export default function AdminDepartments() {
  return (
    <DashboardLayout role="admin" title="Departments">
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <Card key={d.id} className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">{d.name}</h3>
                    <p className="text-xs text-muted-foreground">Officer: {d.officerName}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                  <p className="text-2xl font-bold text-foreground">{d.complaintCount}</p>
                  <p className="text-xs text-muted-foreground">Active Complaints</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}