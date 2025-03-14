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
    const supabaseUrl = Deno.env.get("PROJECT_URL") || Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase credentials. Make sure PROJECT_URL/SUPABASE_URL and SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY are set.");
    }

    console.log("Connecting to Supabase:", supabaseUrl);
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Verify the profiles table exists and has the correct columns
    try {
      console.log("Checking profiles table...");
      const { data: columns, error: columnsError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (columnsError) {
        console.error("Error checking profiles table:", columnsError);
        throw new Error(`Profiles table check failed: ${columnsError.message}`);
      }
      
      console.log("Profiles table check successful");
    } catch (tableError) {
      console.error("Error checking profiles table:", tableError);
      throw new Error(`Failed to verify profiles table: ${tableError.message}`);
    }

    // Update user verification status in the profiles table, not users table
    console.log("Updating profile for user:", userId);
    const updateData = {
      id_verified,
      id_verification_date,
      id_image_path,
    };
    console.log("Update data:", updateData);
    
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Database update error:", error);
      throw new Error(`Database update failed: ${error.message}`);
    }

    console.log("User verification status updated successfully. Response:", data);
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error updating user verification:", error);
    
    // Create a detailed error object for debugging
    const errorDetails = {
      success: false,
      message: error.message || "An error occurred during profile update",
      error: {
        name: error.name || "Unknown",
        message: error.message || "No message available",
        stack: error.stack || "No stack trace available",
        toString: error.toString()
      }
    };
    
    return new Response(JSON.stringify(errorDetails), {
      status: 200, // Return 200 status to avoid the Edge Function error while still communicating the failure
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
