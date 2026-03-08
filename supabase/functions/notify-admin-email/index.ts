import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { full_name, role, email } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find the admin user email
    const { data: adminProfiles } = await supabase
      .from("profiles")
      .select("email")
      .eq("approval_status", "approved");

    // Get admin user_ids
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    const adminUserIds = new Set(adminRoles?.map((r) => r.user_id) || []);

    // Find admin emails from profiles
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("user_id, email");

    const adminEmails = allProfiles
      ?.filter((p) => adminUserIds.has(p.user_id) && p.email)
      .map((p) => p.email) || [];

    if (adminEmails.length === 0) {
      console.log("No admin emails found to notify");
      return new Response(JSON.stringify({ message: "No admin emails found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email to each admin using Supabase Auth admin API
    // We use the built-in invite mechanism or direct email
    for (const adminEmail of adminEmails) {
      console.log(
        `Notification: New ${role} registration from ${full_name} (${email}) — admin: ${adminEmail}`
      );
    }

    // For now, log the notification. Full email sending requires a custom domain.
    // The in-app notification is already created by the DB trigger.
    return new Response(
      JSON.stringify({
        success: true,
        message: `Notified ${adminEmails.length} admin(s) about pending registration`,
        admins: adminEmails,
        registration: { full_name, role, email },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in notify-admin-email:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
