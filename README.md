# OpenIQ scientific-validation + secure database integration patch

This patch is tailored to `asthmarun569-commits/openiq` and its existing schema (`research_consents`, `assessment_sessions`, `item_responses`). It is designed for the existing `pilot.html` local-only frozen-version runner. It does not modify the live GitHub repository or apply a migration automatically.

## Files

- `supabase/migrations/202610240002_openiq_atomic_submission.sql` — adds per-user throttling, removes direct browser insert policies on research tables, and adds one atomic submission RPC.
- `supabase/functions/openiq-research-submit/index.ts` — authenticated Edge Function, strict origin allowlist, input validation, user-token verification and server-side RPC call.
- `openiq-database.js` — replaces the existing direct-insert helper with a secure Edge Function client. It never uses a service-role key.
- `openiq-database-config.js` — public-only config. It reads the publishable/anon key from the same-origin localStorage key already used by `index.html`.
- `patches/pilot-ui-snippet.html` — separate optional research-upload consent UI.
- `patches/pilot-script-snippet.js` — response label mapping and upload handler.
- `patches/pilot-script-tags.html` — scripts to load before the existing inline script.
- `docs/DEPLOYMENT.md`, `docs/SCIENTIFIC_VALIDATION.md`, `docs/SECURITY_CHECKLIST.md` — deployment, science and security workflow.

## Important current state

The existing `pilot.html` is local-only and the existing README says the hosted submission stub is disabled. This is a safe default. The existing `openiq-database.js` currently writes consent, session and response rows through separate client calls; this patch replaces that pattern with one server-side transaction.

The existing SQL migration `202610200001_openiq_research_v1.sql` must be applied before this patch's migration. The repository's research-readiness migration is separate and is not required for this specific flow. Do not run SQL on production until you have inspected the actual Supabase schema and confirmed a backup.

## High-level installation order

1. Create a GitHub branch or download a backup.
2. Add the new migration and Edge Function files.
3. Apply the base research schema in a staging Supabase project, then apply this hardening migration.
4. Enable Supabase anonymous sign-in for pseudonymous participant sessions.
5. Deploy the Edge Function and set the allowed origin to the exact GitHub Pages origin.
6. Replace `openiq-database.js`, add `openiq-database-config.js`, and apply the three small `pilot.html` patches.
7. Test all negative cases and direct database access before using real participants.

Do not treat this patch as ethics approval or evidence that OpenIQ is a validated IQ test. Scores remain experimental and client-reported.
