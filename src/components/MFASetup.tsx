import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, Copy, CheckCircle } from "lucide-react";

interface Props {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function MFASetup({ onComplete, onSkip }: Props) {
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [factorId, setFactorId] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"setup" | "verify">("setup");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    enrollMFA();
  }, []);

  const enrollMFA = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "BGCTUB Admin Auth",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setFactorId(data.id);
    setStep("verify");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });
    if (challengeError) {
      setLoading(false);
      toast({ title: "Error", description: challengeError.message, variant: "destructive" });
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode,
    });
    setLoading(false);
    if (verifyError) {
      toast({ title: "Invalid Code", description: "Please check the code and try again.", variant: "destructive" });
      return;
    }
    toast({ title: "2FA Enabled!", description: "Two-factor authentication is now active." });
    onComplete();
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-display text-2xl">Setup Two-Factor Auth</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </CardHeader>
        <CardContent>
          {step === "verify" && qrCode ? (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="flex justify-center">
                <img src={qrCode} alt="QR Code for 2FA" className="rounded-lg border border-border" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Manual entry key</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">{secret}</code>
                  <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={copySecret}>
                    {copied ? <CheckCircle className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Verification Code</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || verifyCode.length !== 6}>
                {loading ? "Verifying..." : "Enable 2FA"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Setting up...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
