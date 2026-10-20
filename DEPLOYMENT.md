# Deployment checklist: Supabase + GitHub Pages

## A. Create the hosted database

1. Create a new Supabase project dedicated to OpenIQ research.
2. In the SQL Editor, run `supabase/migrations/202610200001_openiq_research_v1.sql`.
3. In Authentication settings, enable anonymous sign-ins.
4. Configure anti-abuse settings and CAPTCHA if available for anonymous sign-ins.
5. Keep database backups and retention settings appropriate to the study and applicable law.
6. Do not enable public table reads or expose a service-role key.

## B. Configure the static website

1. Load Supabase JS v2 on the website before `web/openiq-database.js`, using the official Supabase CDN or a pinned local copy.
2. Set `window.OPENIQ_DATABASE_CONFIG` before loading the helper:
   ```html
   <script>
     window.OPENIQ_DATABASE_CONFIG = {
       supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
       supabaseAnonKey: "YOUR_PUBLIC_ANON_KEY",
       appRelease: "0.11.0",
       formId: "openiq-fixed-form-v1",
       consentVersion: "research-consent-v1"
     };
   </script>
   ```
3. The URL and anon key are public client configuration, not secrets. The database policies must protect the data. Never use the service-role key in the browser.
4. Add a distinct, unchecked opt-in control for hosted research submission. Do not infer consent from the ordinary test-start checkbox.
5. Call `window.OpenIQDatabase.submitSession(report, consentMetadata)` only after explicit research consent and after the participant completes the test. Do not silently submit data.
6. Explain in the consent notice what is stored, purpose, retention period, withdrawal/contact process, and that data is sent to a hosted service.
7. Keep a local download option available. A hosted database does not replace a participant-controlled export.

## C. Browser integration assumptions

The helper expects a report object containing:
- `responses`: array with `itemId`, `correct`, `domainCode`, `family`, `answer`, `responseTimeMs`, and optionally `presentationMs`.
- `correct`, `total`, `sessionDurationMs`, `generatedAt`, and `finishedAt` fields where available.

The current OpenIQ exporter uses `itemId` in its response objects. Verify this against the exact deployed build before enabling live submissions. The helper rejects duplicates and validates shape, but does not establish that the form itself was administered correctly.

## D. Required pre-launch tests

- No network request occurs unless research consent is checked.
- Missing consent blocks submission.
- Anonymous user can insert their own consent/session/responses.
- One user cannot insert a session under another user's ID.
- Browser cannot read other participants' records; a participant can read only their own consent/session metadata, not item responses.
- Duplicate item IDs are rejected.
- Missing/extra items are rejected against the fixed form manifest in your integration layer.
- Different release/form IDs are kept separate.
- No service-role key is present in HTML, JavaScript, source maps, commit history, or browser network requests.
- Failed submissions do not block the local result or download.
- Withdrawal workflow is tested with the research administrator.
- Test database is used before real participant recruitment.

## E. Deploying code

GitHub integration write access was denied during preparation, so no repository branch or live deployment was created. After write access is available, add the migration and helper to the repository, integrate the helper into `index.html`/`app.js`, review the diff, run the project's tests, and merge only after the pre-launch checks pass.

## F. Privacy and governance

This is a technical checklist, not legal advice. Before collecting data, decide and document the study owner, lawful basis/consent, participant age eligibility, retention/deletion period, withdrawal procedure, researcher access, breach response, and any institutional ethics review required for the study. Do not collect data from minors through this pilot without an appropriate approved protocol.
