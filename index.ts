import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const enc = new TextEncoder();
const MAX_BYTES = 64_000;
const allowedDomains = new Set(["VCI", "WMI", "PRI", "PSI", "OTHER"]);

function reply(status: number, body: Record<string, unknown>, origin = "") {
  return new Response(JSON.stringify(body), { status, headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...(origin ? { "access-control-allow-origin": origin, "vary": "Origin", "access-control-allow-headers": "authorization, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS" } : {})
  }});
}
function isIso(value: unknown): value is string { return typeof value === "string" && value.length <= 40 && Number.isFinite(Date.parse(value)); }

Deno.serve(async req => {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigins = (Deno.env.get("OPENIQ_ALLOWED_ORIGINS") ?? "").split(",").map(x => x.trim()).filter(Boolean);
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !anonKey || !serviceKey || !allowedOrigins.length) return reply(500, { error: "server_not_configured" });
  if (origin && !allowedOrigins.includes(origin)) return reply(403, { error: "origin_not_allowed" });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: {
    "access-control-allow-origin": origin, "vary": "Origin",
    "access-control-allow-headers": "authorization, apikey, content-type",
    "access-control-allow-methods": "POST, OPTIONS", "access-control-max-age": "600"
  }});
  if (req.method !== "POST") return reply(405, { error: "method_not_allowed" }, origin);
  if (req.headers.get("apikey") !== anonKey) return reply(401, { error: "unauthorized" }, origin);
  const bearer = req.headers.get("authorization") ?? "";
  if (!bearer.startsWith("Bearer ")) return reply(401, { error: "sign_in_required" }, origin);
  const accessToken = bearer.slice(7);
  if (accessToken.length > 6000) return reply(401, { error: "invalid_token" }, origin);
  if (!(req.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) return reply(415, { error: "json_required" }, origin);
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BYTES) return reply(413, { error: "payload_too_large" }, origin);
  const raw = await req.text();
  if (enc.encode(raw).length > MAX_BYTES) return reply(413, { error: "payload_too_large" }, origin);
  let p: any;
  try { p = JSON.parse(raw); } catch { return reply(400, { error: "invalid_json" }, origin); }
  if (p?.researchConsent !== true || typeof p?.consentVersion !== "string" || !p.consentVersion.trim()) return reply(400, { error: "explicit_research_consent_required" }, origin);
  const report = p.report;
  if (!report || !Array.isArray(report.responses) || report.responses.length < 1 || report.responses.length > 200 || report.total !== report.responses.length || !Number.isInteger(report.correct) || report.correct < 0 || report.correct > report.total) return reply(400, { error: "invalid_report" }, origin);
  if (!isIso(report.completedAt) || (report.startedAt && !isIso(report.startedAt))) return reply(400, { error: "invalid_timestamps" }, origin);
  if (typeof p.formId !== "string" || p.formId.length < 1 || p.formId.length > 100 || typeof p.appRelease !== "string" || !/^\d+\.\d+\.\d+([+-][A-Za-z0-9.-]+)?$/.test(p.appRelease)) return reply(400, { error: "invalid_release_or_form" }, origin);
  const ids = new Set<string>();
  const rows = [];
  let answered = 0;
  for (let i = 0; i < report.responses.length; i++) {
    const r = report.responses[i];
    if (!r || typeof r.itemId !== "string" || r.itemId.trim().length < 1 || r.itemId.length > 200 || ids.has(r.itemId)) return reply(400, { error: "invalid_or_duplicate_item" }, origin);
    ids.add(r.itemId);
    const selected = r.selectedOptionLabel == null ? null : String(r.selectedOptionLabel).slice(0, 500);
    const isAnswered = selected !== null;
    if (r.responseTimeMs != null && (!Number.isInteger(r.responseTimeMs) || r.responseTimeMs < 0 || r.responseTimeMs > 3600000)) return reply(400, { error: "invalid_response_time" }, origin);
    if (r.presentationMs != null && (!Number.isInteger(r.presentationMs) || r.presentationMs < 0 || r.presentationMs > 60000)) return reply(400, { error: "invalid_stimulus_duration" }, origin);
    if (typeof r.isCorrect !== "boolean") return reply(400, { error: "invalid_correctness_field" }, origin);
    if (isAnswered) answered++;
    rows.push({
      item_id: r.itemId,
      domain_code: allowedDomains.has(r.domainCode) ? r.domainCode : "OTHER",
      template_id: typeof r.family === "string" ? r.family.slice(0, 100) : null,
      item_order: i,
      selected_option_label: selected,
      is_answered: isAnswered,
      response_time_ms: r.responseTimeMs ?? null,
      stimulus_duration_ms: r.presentationMs ?? null,
      client_reported_correct: isAnswered ? r.isCorrect : null
    });
  }
  if (report.answeredItems != null && report.answeredItems !== answered) return reply(400, { error: "answered_count_mismatch" }, origin);

  const userClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await userClient.auth.getUser(accessToken);
  if (userError || !userData.user) return reply(401, { error: "invalid_or_expired_session" }, origin);
  const service = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const session = {
    id: crypto.randomUUID(),
    app_release: p.appRelease,
    form_id: p.formId,
    mode: report.mode === "calibration" ? "calibration" : "pilot",
    age_band: p.ageBand ?? null,
    device_class: p.deviceClass ?? null,
    started_at: report.startedAt ?? null,
    completed_at: report.completedAt,
    item_count: report.total,
    raw_correct_count: report.correct
  };
  const { data, error } = await service.rpc("openiq_submit_research_session", {
    p_user_id: userData.user.id,
    p_consent_id: crypto.randomUUID(),
    p_consent_version: p.consentVersion.slice(0, 80),
    p_session: session,
    p_responses: rows
  });
  if (error) {
    if (error.message.includes("rate_limit_exceeded")) return reply(429, { error: "rate_limit_exceeded" }, origin);
    console.error("OpenIQ submission failed", { code: error.code, message: error.message });
    return reply(400, { error: "submission_rejected" }, origin);
  }
  return reply(201, { status: "submitted", sessionId: data?.session_id, savedResponses: data?.response_count }, origin);
});
