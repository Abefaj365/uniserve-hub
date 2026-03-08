import { Badge } from "@/components/ui/badge";
import type { ComplaintStatus, Priority } from "@/lib/mockData";

export function StatusBadge({ status }: { status: ComplaintStatus }) {
  const styles: Record<ComplaintStatus, string> = {
    Pending: "bg-warning/15 text-warning border-warning/30 hover:bg-warning/20",
    "In Progress": "bg-info/15 text-info border-info/30 hover:bg-info/20",
    Resolved: "bg-success/15 text-success border-success/30 hover:bg-success/20",
    Closed: "bg-muted text-muted-foreground border-border hover:bg-muted",
  };
  return <Badge variant="outline" className={styles[status]}>{status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    Low: "bg-muted text-muted-foreground border-border",
    Medium: "bg-info/15 text-info border-info/30",
    High: "bg-warning/15 text-warning border-warning/30",
    Urgent: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={styles[priority]}>{priority}</Badge>;
}