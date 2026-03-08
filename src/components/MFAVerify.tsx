import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";

interface Props {
  onVerified: () => void;
  onCancel: () => void;
}

export default function MFAVerify({ onVerified, onCancel }: Props) {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Get the user's TOTP factors
    const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError || !factorsData?.totp?.length) {
      setLoading(false);
      toast({ title: "Error", description: "No 2FA factor found.", variant: "destructive" });
      return;
    }

    const factor = factorsData.totp[0];

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });
    if (challengeError) {
      setLoading(false);
      toast({ title: "Error", description: challengeError.message, variant: "destructive" });
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code,
    });
    setLoading(false);
    if (verifyError) {
      toast({ title: "Invalid Code", description: "The code you entered is incorrect. Please try again.", variant: "destructive" });
      return;
    }

    toast({ title: "Verified!", description: "Two-factor authentication verified." });
    onVerified();
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">Two-Factor Verification</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="space-y-2">
              <Label>Authentication Code</Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={onCancel}>
              Cancel & Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
