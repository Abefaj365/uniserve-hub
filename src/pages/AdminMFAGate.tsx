import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import MFASetup from "@/components/MFASetup";
import MFAVerify from "@/components/MFAVerify";

type MFAStatus = "loading" | "needs_setup" | "needs_verify" | "verified";

export default function AdminMFAGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MFAStatus>("loading");

  useEffect(() => {
    checkMFA();
  }, []);

  const checkMFA = async () => {
    // Check current AAL level
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    
    if (aalData?.currentLevel === "aal2") {
      // Already verified with 2FA
      setStatus("verified");
      return;
    }

    // Check if user has any verified TOTP factors
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const verifiedFactors = factors?.totp?.filter(f => f.status === "verified") ?? [];

    if (verifiedFactors.length === 0) {
      // No 2FA set up yet - needs setup
      setStatus("needs_setup");
    } else {
      // Has 2FA but hasn't verified this session
      setStatus("needs_verify");
    }
  };

  const handleSetupComplete = () => {
    setStatus("verified");
  };

  const handleVerified = () => {
    setStatus("verified");
  };

  const handleCancel = async () => {
    await supabase.auth.signOut();
  };

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Checking security...</div>;
  }

  if (status === "needs_setup") {
    return <MFASetup onComplete={handleSetupComplete} />;
  }

  if (status === "needs_verify") {
    return <MFAVerify onVerified={handleVerified} onCancel={handleCancel} />;
  }

  return <>{children}</>;
}
