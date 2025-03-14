import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, id_verified, id_verification_date, id_image_path } =
      await req.json();

    if (!userId) {
      throw new Error("Missing required parameters");
    }

    console.log("Updating user verification status for user:", userId);

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get("PROJECT_URL");
    const supabaseServiceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Update user verification status in the profiles table, not users table
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({
        id_verified,
        id_verification_date,
        id_image_path,
      })
      .eq("id", userId);

    if (error) {
      console.error("Database update error:", error);
      throw error;
    }

    console.log("User verification status updated successfully");
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user verification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
