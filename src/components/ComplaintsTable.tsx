import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComplaintRow {
  id: string;
  complaint_id: string;
  title: string;
  category: string;
  department_name: string;
  status: string;
  priority: string;
  created_at: string;
  student_name: string;
}

interface Props {
  data: ComplaintRow[];
  onStatusChange?: (id: string, status: string) => void;
  showActions?: boolean;
}

export default function ComplaintsTable({ data, onStatusChange, showActions }: Props) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Department</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
            {showActions && <TableHead className="font-semibold">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((c) => (
            <TableRow key={c.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono text-xs text-muted-foreground">{c.complaint_id}</TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{c.student_name}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{c.category}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{c.department_name}</TableCell>
              <TableCell><StatusBadge status={c.status as any} /></TableCell>
              <TableCell><PriorityBadge priority={c.priority as any} /></TableCell>
              <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</TableCell>
              {showActions && onStatusChange && (
                <TableCell>
                  <Select value={c.status} onValueChange={(val) => onStatusChange(c.id, val)}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
