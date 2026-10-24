/* OpenIQ secure research submission client.
 * No direct browser writes to research tables. Requires Supabase JS v2 and
 * openiq-database-config.js. The anon/publishable key is public; never put a
 * service-role key in this file or any browser-delivered asset.
 */
(() => {
  "use strict";
  const config = window.OPENIQ_DATABASE_CONFIG || {};
  let client = null;

  function getClient() {
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error("Research upload is not configured. Enter the public Supabase key on the main OpenIQ page, then reload this page.");
    }
    if (!window.supabase?.createClient) throw new Error("Supabase JS v2 did not load.");
    if (!client) client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
    });
    return client;
  }

  function normalizeReport(report) {
    if (!report || !Array.isArray(report.responses)) throw new Error("The local assessment report is missing item responses.");
    const total = Number.isInteger(report.total) ? report.total : report.totalItems;
    const correct = Number.isInteger(report.correct) ? report.correct : report.rawScore;
    if (!Number.isInteger(total) || total !== report.responses.length || total < 1 || total > 200) {
      throw new Error("The reported item count is invalid.");
    }
    if (!Number.isInteger(correct) || correct < 0 || correct > total) throw new Error("The reported raw score is invalid.");
    if (!report.completedAt || !Number.isFinite(Date.parse(report.completedAt))) throw new Error("The completion timestamp is invalid.");
    const seen = new Set();
    const responses = report.responses.map((r, index) => {
      const itemId = String(r?.itemId ?? "").trim();
      if (!itemId || itemId.length > 200 || seen.has(itemId)) throw new Error("An item ID is missing or duplicated.");
      seen.add(itemId);
      const label = r.selectedOptionLabel == null ? null : String(r.selectedOptionLabel).slice(0, 500);
      const answered = label !== null;
      const responseTimeMs = r.responseTimeMs == null ? null : Math.round(Number(r.responseTimeMs));
      if (responseTimeMs !== null && (!Number.isInteger(responseTimeMs) || responseTimeMs < 0 || responseTimeMs > 3600000)) {
        throw new Error("A response time is outside the accepted range.");
      }
      const presentationMs = r.presentationMs == null ? null : Math.round(Number(r.presentationMs));
      if (presentationMs !== null && (!Number.isInteger(presentationMs) || presentationMs < 0 || presentationMs > 60000)) {
        throw new Error("A stimulus duration is outside the accepted range.");
      }
      const correctFlag = typeof r.isCorrect === "boolean" ? r.isCorrect : r.correct;
      if (typeof correctFlag !== "boolean") throw new Error("An item is missing the client-reported correctness field.");
      return {
        itemId,
        domainCode: String(r.domainCode ?? r.domain ?? "OTHER").split(/[ —-]/)[0],
        family: typeof r.family === "string" ? r.family : null,
        selectedOptionLabel: label,
        isAnswered: answered,
        responseTimeMs,
        presentationMs,
        isCorrect: answered ? correctFlag : false,
      };
    });
    const answeredItems = responses.filter(r => r.isAnswered).length;
    if (Number.isInteger(report.answeredItems) && report.answeredItems !== answeredItems) throw new Error("Answered-item count does not match the response list.");
    return {
      total, correct, answeredItems,
      mode: report.mode === "calibration" ? "calibration" : "pilot",
      startedAt: report.startedAt ?? null,
      completedAt: report.completedAt,
      responses
    };
  }

  async function submitSession(report, metadata = {}) {
    if (metadata.researchConsent !== true) throw new Error("Separate, explicit research-upload consent is required.");
    if (!config.appRelease || !/^\d+\.\d+\.\d+([+-][A-Za-z0-9.-]+)?$/.test(config.appRelease) || !config.formId || !config.consentVersion) {
      throw new Error("App release, form ID, and consent version must be configured.");
    }
    const normalized = normalizeReport(report);
    const supabase = getClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    let session = sessionData.session;
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      session = data.session;
    }
    if (!session?.access_token) throw new Error("Could not create a pseudonymous research session.");
    const payload = {
      researchConsent: true,
      consentVersion: config.consentVersion,
      appRelease: config.appRelease,
      formId: config.formId,
      ageBand: metadata.ageBand ?? null,
      deviceClass: ["mobile", "tablet", "desktop", "other"].includes(metadata.deviceClass) ? metadata.deviceClass : "other",
      report: {
        mode: normalized.mode,
        startedAt: normalized.startedAt,
        completedAt: normalized.completedAt,
        total: normalized.total,
        correct: normalized.correct,
        answeredItems: normalized.answeredItems,
        responses: normalized.responses.map(r => ({
          itemId: r.itemId,
          domainCode: r.domainCode,
          family: r.family,
          selectedOptionLabel: r.selectedOptionLabel,
          isCorrect: r.isCorrect,
          responseTimeMs: r.responseTimeMs,
          presentationMs: r.presentationMs
        }))
      }
    };
    const { data, error } = await supabase.functions.invoke("openiq-research-submit", {
      body: payload,
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    if (error) throw new Error("Secure research submission failed. Your local export is still available.");
    if (!data || data.status !== "submitted") throw new Error("The server did not confirm the research submission. Keep your local export.");
    return data;
  }

  window.OpenIQDatabase = Object.freeze({ isConfigured: () => Boolean(config.supabaseUrl && config.supabaseAnonKey), normalizeReport, submitSession });
})();
