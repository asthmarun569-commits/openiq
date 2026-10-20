/* OpenIQ hosted research submission helper v1.0.0.
 * Requires Supabase JS v2 loaded as window.supabase.
 * This file must not contain a service-role key.
 */
(() => {
  "use strict";
  const config = window.OPENIQ_DATABASE_CONFIG || {};
  const hasConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  let clientPromise = null;

  function getClient() {
    if (!hasConfig) throw new Error("Hosted research storage is not configured.");
    if (!window.supabase?.createClient) throw new Error("Supabase JS v2 is not loaded.");
    if (!clientPromise) {
      clientPromise = Promise.resolve(window.supabase.createClient(
        config.supabaseUrl,
        config.supabaseAnonKey,
        { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }
      ));
    }
    return clientPromise;
  }

  function validateReport(report) {
    if (!report || !Array.isArray(report.responses) || report.responses.length < 1) {
      throw new Error("The result report has no item responses.");
    }
    const ids = report.responses.map(r => r?.itemId);
    if (ids.some(id => typeof id !== "string" || !id.trim())) {
      throw new Error("Every response must contain a valid item ID.");
    }
    if (new Set(ids).size !== ids.length) {
      throw new Error("Duplicate item IDs detected; this session was not submitted.");
    }
    for (const r of report.responses) {
      if (typeof r.correct !== "boolean") throw new Error("A response has an invalid correctness field.");
      if (r.responseTimeMs != null && (!Number.isFinite(r.responseTimeMs) || r.responseTimeMs < 0)) {
        throw new Error("A response has an invalid response time.");
      }
    }
    if (!Number.isInteger(report.total) || report.total !== report.responses.length) {
      throw new Error("The reported total does not match the response count.");
    }
    if (!Number.isInteger(report.correct) || report.correct < 0 || report.correct > report.total) {
      throw new Error("The reported raw score is invalid.");
    }
    return true;
  }

  async function submitSession(report, metadata = {}) {
    validateReport(report);
    if (metadata.researchConsent !== true) {
      throw new Error("Explicit research consent is required before submission.");
    }
    if (!config.appRelease || !config.formId || !config.consentVersion) {
      throw new Error("Release, form, and consent versions must be configured.");
    }

    const supabase = await getClient();
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) throw authError;
    if (!authData.session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    }
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const userId = userData.user?.id;
    if (!userId) throw new Error("Could not establish a pseudonymous research session.");

    const consentId = crypto.randomUUID();
    const { error: consentError } = await supabase
      .from("research_consents")
      .insert({
        id: consentId,
        user_id: userId,
        consent_version: config.consentVersion,
        research_purpose: "OpenIQ exploratory item calibration"
      });
    if (consentError) throw consentError;

    const responseRows = report.responses.map((r, index) => ({
      user_id: userId,
      item_id: r.itemId,
      domain_code: ["VCI", "WMI", "PRI", "PSI"].includes(r.domainCode) ? r.domainCode : "OTHER",
      template_id: typeof r.family === "string" ? r.family.slice(0, 100) : null,
      item_order: index,
      selected_option_label: r.answer == null ? null : String(r.answer).slice(0, 500),
      is_answered: r.answer != null,
      response_time_ms: Number.isFinite(r.responseTimeMs) && r.responseTimeMs >= 0 ? Math.round(r.responseTimeMs) : null,
      stimulus_duration_ms: Number.isFinite(r.presentationMs) && r.presentationMs >= 0 ? Math.round(r.presentationMs) : null,
      client_reported_correct: r.answer == null ? null : r.correct
    }));

    const sessionPayload = {
      user_id: userId,
      consent_id: consent.id,
      app_release: config.appRelease,
      form_id: config.formId,
      mode: report.mode === "calibration" ? "calibration" : "pilot",
      age_band: ["18-24","25-34","35-44","45-54","55-64","65+"].includes(metadata.ageBand) ? metadata.ageBand : null,
      device_class: ["mobile","tablet","desktop","other"].includes(metadata.deviceClass) ? metadata.deviceClass : null,
      started_at: Number.isFinite(report.startedAtMs) ? new Date(report.startedAtMs).toISOString() : null,
      completed_at: report.finishedAt ? new Date(report.finishedAt).toISOString() : new Date().toISOString(),
      item_count: report.total,
      raw_correct_count: report.correct,
      client_reported_total: report.total
    };

    const sessionId = crypto.randomUUID();
    const { error: sessionError } = await supabase
      .from("assessment_sessions")
      .insert({ id: sessionId, ...sessionPayload });
    if (sessionError) throw sessionError;

    const rows = responseRows.map(row => ({ ...row, session_id: sessionId }));
    const { error: responsesError } = await supabase.from("item_responses").insert(rows);
    if (responsesError) {
      // Best-effort cleanup: no browser DELETE policy is intentionally provided.
      // An incomplete session is retained for administrator review and should be
      // marked/cleaned by the trusted research administration workflow.
      throw new Error("Session metadata was saved, but item responses failed to save. Contact the research administrator.");
    }
    return { sessionId, status: "submitted" };
  }

  window.OpenIQDatabase = Object.freeze({
    isConfigured: () => hasConfig,
    validateReport,
    submitSession
  });
})();
