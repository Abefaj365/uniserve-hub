import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, PriorityBadge } from "./StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ComplaintDetailDialog from "./ComplaintDetailDialog";

interface ComplaintRow {
  id: string;
  complaint_id: string;
  title: string;
  description: string;
  category: string;
  department_name: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  student_name: string;
  student_id_number: string | null;
  user_id: string;
}

interface Props {
  data: ComplaintRow[];
  onStatusChange?: (id: string, status: string, note?: string) => void;
  showActions?: boolean;
}

export default function ComplaintsTable({ data, onStatusChange, showActions }: Props) {
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRow | null>(null);
  const [statusChangeDialog, setStatusChangeDialog] = useState<{ id: string; newStatus: string; title: string } | null>(null);
  const [statusNote, setStatusNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleStatusSelect = (id: string, newStatus: string) => {
    const complaint = data.find(c => c.id === id);
    setStatusChangeDialog({ id, newStatus, title: complaint?.title || "" });
    setStatusNote("");
  };

  const handleConfirmStatusChange = async () => {
    if (!statusChangeDialog || !onStatusChange) return;
    setSubmitting(true);
    await onStatusChange(statusChangeDialog.id, statusChangeDialog.newStatus, statusNote.trim() || undefined);
    setSubmitting(false);
    setStatusChangeDialog(null);
    setStatusNote("");
  };

  return (
    <>
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
                {showActions && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                      {onStatusChange && (
                        <Select value={c.status} onValueChange={(val) => handleStatusSelect(c.id, val)}>
                          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Status Change Note Dialog */}
      <Dialog open={!!statusChangeDialog} onOpenChange={(open) => { if (!open) setStatusChangeDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Changing status of <span className="font-medium text-foreground">"{statusChangeDialog?.title}"</span> to{" "}
              <span className="font-medium text-foreground">{statusChangeDialog?.newStatus}</span>.
            </p>
            <div className="space-y-2">
              <Label htmlFor="status-note">Message / Note (optional)</Label>
              <Textarea
                id="status-note"
                placeholder="Add a message for the student about this status change..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusChangeDialog(null)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleConfirmStatusChange} disabled={submitting}>
              {submitting ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ComplaintDetailDialog
        complaint={selectedComplaint}
        open={!!selectedComplaint}
        onOpenChange={(open) => { if (!open) setSelectedComplaint(null); }}
      />
    </>
  );
}