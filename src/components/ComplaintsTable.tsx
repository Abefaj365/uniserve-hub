import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import type { Complaint } from "@/lib/mockData";

export default function ComplaintsTable({ data }: { data: Complaint[] }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Department</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Priority</TableHead>
            <TableHead className="font-semibold">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((c) => (
            <TableRow key={c.id} className="hover:bg-muted/30 cursor-pointer transition-colors">
              <TableCell className="font-mono text-xs text-muted-foreground">{c.id}</TableCell>
              <TableCell className="font-medium max-w-[200px] truncate">{c.title}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{c.category}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{c.department}</TableCell>
              <TableCell><StatusBadge status={c.status} /></TableCell>
              <TableCell><PriorityBadge priority={c.priority} /></TableCell>
              <TableCell className="text-sm text-muted-foreground">{c.createdAt}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}