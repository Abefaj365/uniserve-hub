import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { categories } from "@/lib/mockData";

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*");
      if (error) throw error;
      return data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setLoading(true);
    const dept = departments?.find(d => d.id === departmentId);

    const { data: complaint, error } = await supabase.from("complaints").insert([{
      title,
      description,
      category,
      department_id: departmentId || null,
      department_name: dept?.name || "Unassigned",
      user_id: user.id,
      student_name: profile.full_name || "Unknown",
      student_id_number: profile.student_id,
    }] as any).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Upload attachments
    for (const file of files) {
      const filePath = `${user.id}/${complaint.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage.from("complaint-attachments").upload(filePath, file);
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from("complaint-attachments").getPublicUrl(filePath);
        await supabase.from("attachments").insert({
          complaint_id: complaint.id,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          uploaded_by: user.id,
        });
      }
    }

    toast({ title: "Complaint Submitted!", description: `Your complaint has been submitted with ID ${complaint.complaint_id}.` });
    setLoading(false);
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
                <Input placeholder="Brief title describing the issue" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Describe your complaint in detail..." className="min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <label className="flex items-center gap-3 rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Drop files here or click to upload</p>
                    <p className="text-xs text-muted-foreground">Images, PDFs up to 10MB</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*,.pdf" onChange={handleFileChange} />
                </label>
                {files.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-1.5">
                        <span className="truncate">{f.name}</span>
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Complaint"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/student")}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
