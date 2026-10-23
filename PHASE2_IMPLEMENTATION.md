# OpenIQ Phase 2 — Authenticated research workspace

## Implemented in this package

- The HTML research workspace can create a draft study in `openiq_research_studies` using the currently signed-in Supabase user.
- Researchers can list their own studies, select a study, and publish a frozen assessment snapshot to `openiq_assessment_versions`.
- Snapshot JSON includes item prompts, options, answer keys, explanations, item review metadata, version label, instructions/consent wording, time limit, shuffle setting, and scoring rule.
- SHA-256 is computed using the browser Web Crypto API and stored with the version. The SQL trigger prevents update/delete of version rows. The digest detects changes to canonical snapshot JSON but does not certify content quality or provide a digital signature.
- Server-side versions can be listed and exported as JSON.
- A follow-up SQL migration makes item-review events append-only and prevents selected backwards study-status transitions.
- A disabled Edge Function stub documents the intentional no-collection boundary.

## Setup

1. Test in a separate Supabase project first. Apply Phase 1 migration `20261023_openiq_research_readiness.sql`, then Phase 2 guard migration `20261023_openiq_phase2_guards.sql`.
2. Confirm the current Supabase publishable key is entered in the existing key field and sign in through the existing cloud question-bank UI.
3. Mark each item `Approved for pilot` and fill reviewer identifier, date, and review notes. This is editorial approval only.
4. In the Assessment version snapshots section, enter a label and create a browser snapshot if you want a local export.
5. In Supabase research workspace, create a draft study. The returned ID is placed into the study ID field.
6. Publish the immutable version. It should appear in the server versions list and be exportable.
7. Test with two accounts: account A must not read account B's studies/versions; anonymous access must be denied.

## Important constraints

- This phase does **not** enable participant response submission.
- Study creation currently stores draft protocol metadata; it is not ethics approval.
- Server-side snapshots freeze the bank currently in the editor. This package does not yet administer a selected server version in the live quiz, nor does it send participant answers to the database.
- The existing `generate-questions-gemini` function URL is unchanged. No existing function is redeployed.
- Do not use real participants until a complete consent/withdrawal workflow, approved protocol, retention/deletion workflow, secure participant-token design, rate limiting, and independent security review are in place.
- Never place a service-role key in HTML or browser code.


## Phase 3 status
Phase 3 adds a separate local-only runner in `../pilot.html`. It can verify and administer an exported frozen version and export a local result. It still does not upload participant responses. See `PHASE3_IMPLEMENTATION.md`.
