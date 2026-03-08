import DashboardLayout from "@/components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const users = [
  { id: "STU-2021-001", name: "Tanvir Ahmed", email: "tanvir@bgctub.ac.bd", role: "Student", dept: "CSE" },
  { id: "STU-2022-015", name: "Nusrat Jahan", email: "nusrat@bgctub.ac.bd", role: "Student", dept: "EEE" },
  { id: "OFF-001", name: "Mr. Rahman", email: "rahman@bgctub.ac.bd", role: "Officer", dept: "Hostel Management" },
  { id: "OFF-002", name: "Dr. Karim", email: "karim@bgctub.ac.bd", role: "Officer", dept: "Laboratory" },
  { id: "ADM-001", name: "Admin User", email: "admin@bgctub.ac.bd", role: "Admin", dept: "IT" },
];

export default function AdminUsers() {
  return (
    <DashboardLayout role="admin" title="Manage Users">
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{u.id}</TableCell>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "Admin" ? "default" : "secondary"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.dept}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}