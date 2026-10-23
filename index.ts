// OpenIQ Phase 2 safety stub. Participant response submission is intentionally disabled.
// Do NOT deploy this stub as a working endpoint. A production endpoint must be designed
// against the approved study protocol, consent/withdrawal requirements, abuse controls,
// and a security review. It must not trust participant-supplied answer keys or scores.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(JSON.stringify({
    ok: false,
    code: "RESEARCH_SUBMISSION_DISABLED",
    message: "Participant submission is not enabled. OpenIQ must complete protocol, consent, privacy, security, and endpoint review before data collection."
  }), {
    status: 501,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
