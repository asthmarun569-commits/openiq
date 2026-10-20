// Optional server-side submission endpoint starter.
// This function is NOT required by the current direct-RLS browser helper.
// If used, deploy it only after adding payload validation, authenticated-user
// verification, rate limiting/CAPTCHA, and an explicit privacy review.
// Do not deploy with permissive CORS or unauthenticated service-role writes.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "https://asthmarun569-commits.github.io",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" }
    });
  }

  // Fail closed until the function is completed and independently reviewed.
  return new Response(JSON.stringify({
    error: "Submission endpoint is not enabled. Use the documented RLS-backed client flow after configuration."
  }), {
    status: 503,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "https://asthmarun569-commits.github.io"
    }
  });
});
