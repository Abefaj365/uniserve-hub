import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const roles = [
  { value: "student", label: "Student" },
  { value: "admin", label: "Administrator" },
];

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState("student");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("departments").select("*");
      if (error) throw error;
      const academicDepts = ["Computer Science & Engineering (CSE)", "Electrical & Electronic Engineering (EEE)", "Business Administration (BBA)", "Law (LLB)", "English", "Pharmacy", "Economics"];
      return data.filter(d => academicDepts.includes(d.name));
    },
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check for duplicate student_id or employee_id using a service-side approach
    // Note: RLS may prevent unauthenticated reads, so we rely on the DB unique constraint
    // and handle the error gracefully after signup

    const metadata: Record<string, string> = {
      full_name: `${firstName} ${lastName}`,
      department,
      role,
    };

    if (role === "student") {
      metadata.student_id = studentId;
    } else {
      metadata.employee_id = employeeId;
    }

    const { error } = await signUp(email, password, metadata);
    if (error) {
      setLoading(false);
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
      return;
    }

    // Sign out immediately to prevent auto-login redirect loop
    await supabase.auth.signOut();
    setLoading(false);

    // Trigger email notification to admin (fire and forget)
    supabase.functions.invoke("notify-admin-email", {
      body: { full_name: `${firstName} ${lastName}`, role, email },
    }).catch(() => {});

    const desc = "Your registration is pending admin approval. You will be able to log in once an administrator approves your account.";
    toast({ title: "Registration Submitted!", description: desc });
    navigate("/login");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Create Account</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Register as a Student or Administrator</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Register As</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            {/* Conditional ID field */}
            {role === "student" ? (
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input placeholder="e.g., STU-2023-001" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Employee ID</Label>
                <Input placeholder="e.g., EMP-001" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required />
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="your@bgctub.ac.bd" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {role === "student" && (
              <div className="space-y-2">
                <Label>Department / Faculty</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {departments?.map((d) => (
                      <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Password</Label>
              <PasswordInput placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Login</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
