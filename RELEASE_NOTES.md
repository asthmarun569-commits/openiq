# OpenIQ Database Release v1.0.0

Date: 2026-10-20

## Included

- Versioned schema for consent records, sessions, and item-level responses.
- Row-level security (RLS) enabled on all research tables.
- Participant-scoped insert policies for authenticated anonymous users.
- No browser-facing SELECT, UPDATE, or DELETE policy.
- Constraints for valid release/form identifiers, item IDs, response indexes, and plausible response times.
- Client helper for opt-in submission and duplicate/shape validation.
- Documentation for deployment and quality checks.

## Not included

- No production database has been created.
- No migration has been applied to a Supabase project.
- No GitHub repository or GitHub Pages files have been changed.
- No participant data has been uploaded.
- No IQ conversion, norms, or validated cognitive-index scoring.
- No claim that this database release establishes assessment validity.

## Required before live launch

1. Apply the migration in a new Supabase project.
2. Enable anonymous sign-in and configure anti-abuse controls/CAPTCHA where available.
3. Configure the website with only the Supabase project URL and public anon key.
4. Integrate the helper behind an explicit, separate research-consent checkbox.
5. Test consent withdrawal, failed requests, duplicate IDs, missing responses, and version mismatch.
6. Run a security review and privacy notice review before collecting real participant data.
