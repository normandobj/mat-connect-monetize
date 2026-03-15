import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: any) => {
  console.log(`[CREATE-MEET] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

async function refreshGoogleToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || "Token refresh failed");
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    log("Function started");

    // Auth
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getUser(token);
    if (claimsError || !claimsData.user) throw new Error("Unauthorized");
    const userId = claimsData.user.id;
    log("User authenticated", { userId });

    const { athlete_id, title, description, scheduled_at, visibility } = await req.json();
    if (!athlete_id) throw new Error("Missing athlete_id");
    log("Request params", { athlete_id, title, scheduled_at });

    // Verify athlete owns this profile
    const { data: athlete, error: athleteErr } = await supabaseUser
      .from("athlete_profiles")
      .select("id, user_id, name")
      .eq("id", athlete_id)
      .single();

    if (athleteErr || !athlete || athlete.user_id !== userId) {
      throw new Error("Not authorized for this athlete profile");
    }

    // Use service role for token access
    const supabaseAdmin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get Google tokens
    const { data: tokenRow, error: tokenErr } = await supabaseAdmin
      .from("athlete_google_tokens")
      .select("*")
      .eq("athlete_id", athlete_id)
      .single();

    if (tokenErr || !tokenRow) {
      throw new Error("Google Meet not connected. Connect in settings first.");
    }

    let accessToken = tokenRow.access_token;

    // Refresh if expired
    if (new Date(tokenRow.expires_at) <= new Date()) {
      log("Token expired, refreshing");
      const refreshed = await refreshGoogleToken(tokenRow.refresh_token);
      accessToken = refreshed.access_token;
      const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();
      await supabaseAdmin
        .from("athlete_google_tokens")
        .update({ access_token: accessToken, expires_at: newExpiry })
        .eq("athlete_id", athlete_id);
      log("Token refreshed");
    }

    // Calculate times
    const isInstant = !scheduled_at;
    const startTime = scheduled_at ? new Date(scheduled_at) : new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

    const eventTitle = title || `Live - ${athlete.name}`;

    // Create Google Calendar event with Meet
    const calendarRes = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: eventTitle,
          description: description || `Live session by ${athlete.name} on mydrill.app`,
          start: { dateTime: startTime.toISOString(), timeZone: "America/Sao_Paulo" },
          end: { dateTime: endTime.toISOString(), timeZone: "America/Sao_Paulo" },
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        }),
      }
    );

    const calendarData = await calendarRes.json();
    if (!calendarRes.ok) {
      log("Calendar API error", calendarData);
      throw new Error(calendarData.error?.message || "Failed to create Google Meet");
    }

    const meetUrl = calendarData.conferenceData?.entryPoints?.[0]?.uri;
    if (!meetUrl) throw new Error("No Meet URL returned from Google");
    log("Meet created", { meetUrl, eventId: calendarData.id });

    // Insert content row
    const { data: contentRow, error: contentErr } = await supabaseUser
      .from("content")
      .insert({
        athlete_id,
        type: "live",
        title_pt: eventTitle,
        title_en: title || `Live - ${athlete.name}`,
        description_pt: description || "",
        description_en: description || "",
        visibility: visibility || "subscribers",
        meet_url: meetUrl,
        scheduled_at: startTime.toISOString(),
        is_live_now: isInstant,
        live_status: isInstant ? "live" : "scheduled",
      })
      .select("id")
      .single();

    if (contentErr) {
      log("Content insert error", contentErr);
      throw new Error("Failed to create live content");
    }

    log("Content created", { contentId: contentRow.id });

    // Create notification for subscribers (instant lives)
    if (isInstant) {
      const { data: subs } = await supabaseAdmin
        .from("subscriptions")
        .select("subscriber_id")
        .eq("athlete_id", athlete_id)
        .eq("status", "active");

      if (subs && subs.length > 0) {
        const notifications = subs.map((s: any) => ({
          user_id: s.subscriber_id,
          type: "live",
          actor_id: userId,
          content_id: contentRow.id,
        }));
        await supabaseAdmin.from("notifications").insert(notifications);
        log("Notifications sent", { count: subs.length });
      }
    }

    return new Response(
      JSON.stringify({ success: true, meet_url: meetUrl, content_id: contentRow.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log("ERROR", { message: msg });
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
