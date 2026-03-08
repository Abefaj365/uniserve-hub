import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function AdminSettings() {
  return (
    <DashboardLayout role="admin" title="Settings">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="font-display text-base">System Settings</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>University Name</Label>
              <Input defaultValue="BGC Trust University Bangladesh" />
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input defaultValue="admin@bgctub.ac.bd" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Send email when complaint status changes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-assign Complaints</Label>
                <p className="text-xs text-muted-foreground">Automatically route based on category</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}