import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories, departments } from "@/lib/mockData";
import { Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Complaint Submitted!", description: "Your complaint has been submitted successfully and assigned ID CMP-007." });
    navigate("/student/complaints");
  };

  return (
    <DashboardLayout role="student" title="Submit Complaint">
      <div className="max-w-2xl animate-fade-in">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl">New Complaint / Service Request</CardTitle>
            <p className="text-sm text-muted-foreground">Fill in the details below. Your complaint will be assigned to the appropriate department.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Complaint Title</Label>
                <Input placeholder="Brief title describing the issue" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your complaint in detail..." className="min-h-[120px]" />
              </div>
              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
                    <p className="text-xs text-muted-foreground">Images, PDFs up to 10MB</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">Submit Complaint</Button>
                <Button type="button" variant="outline" onClick={() => navigate("/student")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}