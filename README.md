# OpenIQ hosted database release v1.0.0

Status: **release scaffold prepared; not deployed or connected to the live website**.

This package provides a privacy-minimizing Supabase database migration, a browser-side integration module, and deployment/QA instructions for the OpenIQ static GitHub Pages site.

## What this release does

- Stores consented, pseudonymous assessment sessions and item-level responses.
- Records the assessment release and form ID with every session.
- Keeps data private: no public read policy is provided.
- Keeps IQ/norm conversion disabled. Raw scores are exploratory only.
- Rejects duplicate item IDs and invalid session payloads in the browser integration helper.
- Avoids names, emails, phone numbers, exact dates of birth, and IP-address storage.
- Uses Supabase Auth anonymous sessions so writes are associated with a pseudonymous user ID.

## Important limitations

1. This is a **database integration scaffold**, not a claim of psychometric validation.
2. The live site has not been modified. The prior GitHub integration attempt returned `403 Resource not accessible by integration`; creating a branch/PR was also denied.
3. You must create a Supabase project, apply the SQL migration, enable anonymous sign-in, configure abuse controls/CAPTCHA as supported by your project, and add the public project URL and anon key to the website.
4. Never put a Supabase `service_role` key in browser code or GitHub Pages.
5. Because OpenIQ is a static client-side assessment, answers and item keys are visible to users in browser code. Data submitted by a browser is not proof that the participant answered honestly. Treat it as research data requiring quality checks, not as a secure or clinical assessment.
6. This migration intentionally provides no SELECT policy for participant-facing browser clients. Researchers should use a trusted admin environment with appropriate access controls to export/analyze data. Do not add a public read policy.
7. This release does not upload historical JSON exports automatically. Existing exports should be reviewed, de-identified, and imported through a separate controlled research process.

## Files

- `supabase/migrations/202610200001_openiq_research_v1.sql` — schema, constraints, indexes, RLS and policies.
- `web/openiq-database.js` — browser integration helper; expects Supabase JS v2 to be loaded.
- `supabase/functions/submit-openiq-session/index.ts` — optional server-side validation endpoint (starter; deployment and rate limiting still required).
- `DEPLOYMENT.md` — setup checklist.
- `DATA_DICTIONARY.md` — field definitions and data minimization.
- `RELEASE_NOTES.md` — release scope and limitations.

## Release policy

Use a frozen `app_release` such as `0.11.0` and a fixed `form_id` for each study cohort. Never combine records from different forms/releases without explicitly modeling those differences. Do not advertise an IQ score or convert raw scores to IQ until an appropriate, independent validation and norming study supports that interpretation.
