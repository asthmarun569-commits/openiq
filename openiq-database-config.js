/* Public browser configuration only. Never place a service-role key here. */
(() => {
  const publicKey = (() => {
    try { return localStorage.getItem("openiq_supabase_publishable_key_v1") || ""; }
    catch (_) { return ""; }
  })();
  window.OPENIQ_DATABASE_CONFIG = Object.freeze({
    supabaseUrl: "https://htoyqrjtnossksjkkruo.supabase.co",
    supabaseAnonKey: publicKey,
    appRelease: "0.14.0",
    formId: "openiq-pilot-v1",
    consentVersion: "openiq-research-upload-v1"
  });
})();
