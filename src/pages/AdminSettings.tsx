import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldOff, Loader2 } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

export default function AdminSettings() {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // 2FA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaToggling, setMfaToggling] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    setMfaLoading(true);
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verified = factors?.totp?.filter(f => f.status === "verified") ?? [];
    setMfaEnabled(verified.length > 0);
    setMfaLoading(false);
  };

  const [showMFASetup, setShowMFASetup] = useState(false);

  const handleToggleMFA = async (enabled: boolean) => {
    if (enabled) {
      setShowMFASetup(true);
    } else {
      // Unenroll all TOTP factors
      setMfaToggling(true);
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactors = factors?.totp ?? [];
      for (const factor of totpFactors) {
        await supabase.auth.mfa.unenroll({ factorId: factor.id });
      }
      setMfaEnabled(false);
      setMfaToggling(false);
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been turned off." });
    }
  };

  const handleMFASetupComplete = () => {
    setShowMFASetup(false);
    setMfaEnabled(true);
    toast({ title: "2FA Enabled!", description: "Two-factor authentication is now active." });
  };

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    const updates: Record<string, any> = {};
    if (newEmail !== user?.email) updates.email = newEmail;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        setSavingProfile(false);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    }

    if (user) {
      await supabase.from("profiles").update({ full_name: fullName } as any).eq("user_id", user.id);
    }

    setSavingProfile(false);
    toast({ title: "Profile Updated", description: "Your profile has been saved." });
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password Changed", description: "Your password has been updated successfully." });
  };

  return (
    <DashboardLayout role="admin" title="Settings">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        {/* Profile Settings */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="font-display text-base">Profile Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              {newEmail !== user?.email && (
                <p className="text-xs text-muted-foreground">A confirmation email will be sent to verify the new address.</p>
              )}
            </div>
            <Button onClick={handleUpdateProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="font-display text-base">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <PasswordInput placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <PasswordInput placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword}>
              {savingPassword ? "Changing..." : "Change Password"}
            </Button>
          </CardContent>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-base flex items-center gap-2">
              {mfaEnabled ? <Shield className="h-4 w-4 text-success" /> : <ShieldOff className="h-4 w-4 text-muted-foreground" />}
              Two-Factor Authentication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{mfaEnabled ? "2FA is enabled" : "2FA is disabled"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {mfaEnabled
                    ? "Your account is protected with an authenticator app."
                    : "Enable to require an authenticator code on every login."}
                </p>
              </div>
              {mfaLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Switch
                  checked={mfaEnabled}
                  onCheckedChange={handleToggleMFA}
                  disabled={mfaToggling}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader><CardTitle className="font-display text-base">System Settings</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>University Name</Label>
              <Input defaultValue="BGC Trust University Bangladesh" />
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
