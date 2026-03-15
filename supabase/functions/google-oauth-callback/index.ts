import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: any) => {
  console.log(`[GOOGLE-OAUTH-CALLBACK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state"); // contains athlete_id
    const error = url.searchParams.get("error");

    if (error) {
      log("OAuth error", { error });
      return redirectWithError("Google authorization was denied");
    }

    if (!code || !state) {
      log("Missing code or state");
      return redirectWithError("Missing authorization code");
    }

    const { athleteId, origin } = JSON.parse(atob(state));
    log("Processing callback", { athleteId });

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      throw new Error("Google OAuth credentials not configured");
    }

    const redirectUri = `${SUPABASE_URL}/functions/v1/google-oauth-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      log("Token exchange failed", tokenData);
      throw new Error(tokenData.error_description || "Token exchange failed");
    }

    log("Token exchange success");

    const supabaseAdmin = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

    // Upsert tokens
    const { error: dbError } = await supabaseAdmin
      .from("athlete_google_tokens")
      .upsert({
        athlete_id: athleteId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || "",
        expires_at: expiresAt,
      }, { onConflict: "athlete_id" });

    if (dbError) {
      log("DB error", dbError);
      throw new Error("Failed to store tokens");
    }

    log("Tokens stored successfully");

    // Redirect back to edit profile with success
    const redirectUrl = `${origin}/dashboard/edit?google_connected=true`;
    return new Response(null, {
      status: 302,
      headers: { Location: redirectUrl },
    });
  } catch (err) {
    log("ERROR", { message: err instanceof Error ? err.message : String(err) });
    return redirectWithError(err instanceof Error ? err.message : "Unknown error");
  }
});

function redirectWithError(message: string) {
  // Fallback redirect
  return new Response(`<html><body><script>window.close(); alert("Error: ${message}");</script></body></html>`, {
    headers: { "Content-Type": "text/html" },
  });
}
