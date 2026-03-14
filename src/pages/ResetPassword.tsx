import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const exchangeCode = async () => {
      // Method 1: PKCE flow — code in query params
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setErrorMsg("Your reset link is invalid or has expired. Please request a new one.");
        } else {
          setReady(true);
        }
        return;
      }

      // Method 2: Implicit flow — tokens in hash
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.replace("#", ""));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        const type = params.get("type");

        if (type === "recovery" && accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });
          if (error) {
            setErrorMsg("Your reset link is invalid or has expired. Please request a new one.");
          } else {
            setReady(true);
          }
          return;
        }
      }

      // Method 3: Listen for PASSWORD_RECOVERY event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });

      // If nothing works after 4 seconds, show error
      const timer = setTimeout(() => {
        setErrorMsg("Your reset link is invalid or has expired. Please request a new one.");
      }, 4000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
      };
    };

    exchangeCode();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.auth.signOut();
    toast({ title: "Password Updated", description: "Your password has been reset successfully. Please log in." });
    navigate("/login");
  };

  if (errorMsg) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardContent className="py-12 text-center">
            <p className="text-destructive font-medium">{errorMsg}</p>
            <Button className="mt-4" variant="outline" onClick={() => navigate("/forgot-password")}>
              Request New Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md border-border/50 shadow-lg">
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>Verifying your reset link...</p>
            <p className="text-sm mt-2">Please wait a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-display text-2xl">Reset Password</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <PasswordInput
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <PasswordInput
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
