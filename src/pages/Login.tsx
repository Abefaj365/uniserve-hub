import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MFASetup from "@/components/MFASetup";
import MFAVerify from "@/components/MFAVerify";

type MFAState = "none" | "setup" | "verify";

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mfaState, setMfaState] = useState<MFAState>("none");
  const [pendingStatus, setPendingStatus] = useState<{ show: boolean; status: string; name: string }>({ show: false, status: "", name: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setLoading(false);
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      return;
    }

    // Check approval status
    const { data: { user: loggedInUser } } = await supabase.auth.getUser();
    if (loggedInUser) {
      const { data: profile } = await supabase.from("profiles").select("approval_status, full_name").eq("user_id", loggedInUser.id).single();
      
      if (profile?.approval_status !== "approved") {
        await supabase.auth.signOut();
        setLoading(false);
        setPendingStatus({ show: true, status: profile?.approval_status || "pending", name: profile?.full_name || "" });
        return;
      }

      // Check if user is admin - enforce 2FA
      const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", loggedInUser.id).single();
      
      if (roleData?.role === "admin") {
        // Check MFA factors
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const verifiedFactors = factors?.totp?.filter(f => f.status === "verified") ?? [];
        
        if (verifiedFactors.length === 0) {
          // Admin needs to set up 2FA
          setLoading(false);
          setMfaState("setup");
          return;
        } else {
          // Admin has 2FA, needs to verify
          setLoading(false);
          setMfaState("verify");
          return;
        }
      }
    }

    setLoading(false);
    toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
  };

  const handleMFASetupComplete = () => {
    setMfaState("none");
    toast({ title: "Login Successful", description: "2FA is now enabled. Redirecting..." });
    // Auth state change will handle redirect
  };

  const handleMFAVerified = () => {
    setMfaState("none");
    toast({ title: "Login Successful", description: "Redirecting to your dashboard..." });
    // Auth state change will handle redirect
  };

  const handleMFACancel = async () => {
    await supabase.auth.signOut();
    setMfaState("none");
  };

  if (mfaState === "setup") {
    return <MFASetup onComplete={handleMFASetupComplete} />;
  }

  if (mfaState === "verify") {
    return <MFAVerify onVerified={handleMFAVerified} onCancel={handleMFACancel} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Welcome Back</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Login to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <PasswordInput placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-center text-sm">
              <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-primary hover:underline">Forgot your password?</Link>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Register</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
