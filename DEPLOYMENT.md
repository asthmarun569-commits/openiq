# Staging deployment guide

## 0. Preconditions and backup

- Confirm the project is `OpenIQ-Research` at `https://htoyqrjtnossksjkkruo.supabase.co`.
- Export the current schema and confirm recovery/backups.
- Apply the repository's base migration `202610200001_openiq_research_v1.sql` to a staging project first if it has not already been applied. This patch's migration depends on the three base research tables.
- Do not run this against production until staging tests pass.

## 1. Apply the hardening migration

Apply `supabase/migrations/202610240002_openiq_atomic_submission.sql` after the base schema. It removes direct authenticated insert policies on the research tables and revokes browser insert/update/delete privileges. After this, the existing old `openiq-database.js` direct-write flow will no longer work; replace it with the file in this package before enabling submissions.

The RPC inserts consent, session metadata and all item rows in a single database transaction. If any row fails, the transaction rolls back rather than leaving a partially submitted session. Raw scores and correctness remain explicitly untrusted client reports because the item bank is delivered to the browser.

## 2. Enable pseudonymous auth

In Supabase Dashboard → Authentication → Sign In / Providers, enable Anonymous sign-ins for the staging project. The browser gets a short-lived authenticated session without asking for a participant email. This does not make a person anonymous in every legal sense; it is a pseudonymous account identifier.

## 3. Deploy the Edge Function

From the repository root with Supabase CLI linked to the staging project:

```sh
supabase functions deploy openiq-research-submit
```

The function expects the default JWT verification to remain enabled. It independently verifies the caller's access token using Supabase Auth and then calls the RPC with the verified user ID.

Set the following secrets in Supabase Function Secrets. Do not commit them:

```sh
supabase secrets set SUPABASE_URL="https://YOUR_PROJECT_REF.supabase.co"
supabase secrets set SUPABASE_ANON_KEY="YOUR_PUBLIC_ANON_KEY"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
supabase secrets set OPENIQ_ALLOWED_ORIGINS="https://YOUR-USERNAME.github.io"
```

Set `OPENIQ_ALLOWED_ORIGINS` to the exact origin, without a path. Add your custom domain only if it is used. Never use `*` in production. The anon/publishable key is public and may appear in the browser; the service-role key is server-only. If a service-role key has ever been pasted into GitHub or a browser file, rotate it.

## 4. Add the browser files and pilot UI

- Replace repository root `openiq-database.js` with the package version.
- Add repository root `openiq-database-config.js`.
- In `pilot.html`, add the contents of `patches/pilot-ui-snippet.html` inside `#resultPanel`, after the local export button.
- In `finish()`, add `selectedOptionLabel: Number.isInteger(answers[q.id]) ? String(q.options[answers[q.id]]) : null` to each response object. Keep the existing index fields for local exports if useful.
- Add the handler from `patches/pilot-script-snippet.js` near the existing export/restart handlers.
- Add the script tags from `patches/pilot-script-tags.html` immediately before the existing inline script. Verify the Supabase CDN script loads before a user clicks upload.

The config reads the public key from `localStorage` key `openiq_supabase_publishable_key_v1`, which the current `index.html` already uses when the researcher enters the public key. If the pilot is opened on a different origin, this localStorage value will not be shared; configure the public key in a user-visible public configuration mechanism for that origin. Never paste a service-role key into any HTML or JS.

## 5. Verify staging

1. Load a frozen assessment version, start it, and complete it.
2. Confirm the result panel offers a separate research-upload consent checkbox. It must be unchecked by default.
3. Without checking it, confirm the upload button is disabled and no network submission occurs.
4. Check it and submit. Expect a confirmed session ID and response count.
5. In Supabase SQL Editor as an administrator, verify one consent row, one session row and the expected item response rows exist for the same pseudonymous `user_id`.
6. Test duplicate item IDs, invalid response times, too many items, invalid tokens, wrong origin, missing consent and repeated submissions.
7. Test direct browser INSERT/UPDATE/DELETE against research tables; these must fail.
8. Test a simulated network failure; the UI must not claim submission succeeded and the local export must remain available.

## Rollback

Disable the Edge Function if there is an incident. Keep the migration and data for investigation. Because the migration removes direct browser insert policies, the old direct-write helper must not be re-enabled as a rollback. Restore the previous local-only pilot behavior while preserving the new restrictive policies. If a schema rollback is needed, plan it with a database administrator; do not blindly drop research tables.
