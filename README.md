# OpenIQ Research Readiness — Phase 3

This package contains the Phase 2 research workspace plus `pilot.html`, a local-only frozen-version administration prototype.

## Files
- `index.html` — Phase 2 researcher/editor workspace.
- `pilot.html` — imports an exported version, verifies SHA-256 when present, requires a consent checkbox and pseudonymous participant code, runs the frozen assessment, and exports results locally.
- `supabase/migrations/` — Phase 1 and Phase 2 SQL migrations; no new database migration is required for this local-only phase.
- `supabase/functions/openiq-research-submit/index.ts` — disabled submission stub; keep disabled.
- `docs/PHASE3_IMPLEMENTATION.md` — scope and test steps.
- `docs/PHASE2_IMPLEMENTATION.md`, `docs/IMPLEMENTATION_AND_TEST_PLAN.md`, `docs/RESEARCH_PROTOCOL_CHECKLIST.md` — prior guidance.

## Important
Participant responses are not uploaded or stored persistently by `pilot.html`. Consent text is a placeholder. This package is not an IQ test validation, ethics approval, or permission to recruit participants. Never place a Supabase service-role key in client code. The existing Gemini Edge Function URL is unchanged. The live GitHub Pages website is not modified by this downloadable package.

## Suggested sequence
1. Back up your repository and Supabase project.
2. Test Phase 2 researcher workspace in a development project.
3. Export a frozen version and test `pilot.html` against the Phase 3 checklist.
4. Complete the research protocol and privacy/security reviews before planning a secure server submission phase.
