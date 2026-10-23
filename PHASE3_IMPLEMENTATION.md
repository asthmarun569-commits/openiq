# OpenIQ Phase 3 — Frozen-version administration (local-only)

## What is added

- `pilot.html`: a separate pilot runner that imports an exported frozen version JSON.
- SHA-256 verification for the Phase 2 server export format (`{ "snapshot": ..., "sha256": "..." }`). A digest mismatch blocks loading.
- Structural validation of item IDs, prompts, options, and answer indices.
- A consent gate, pseudonymous participant code field, optional timer, optional question shuffle, and per-item response-time estimates.
- Raw score summary and downloadable JSON response record, containing the version digest and item order for traceability.

## Privacy and safety boundary

This is **local-only**. It does not submit data to Supabase, call any API, or persist participant responses in browser storage. The response exists in page memory until the researcher exports it. Exported JSON can still be sensitive research data; handle it only under the approved protocol. Do not enter direct identifiers.

The consent wording shown is a placeholder gate, not approved informed-consent text. Before any real human-participant study, complete the protocol checklist and obtain applicable ethics/IRB review, replace the placeholder with study-specific information and consent, define withdrawal and deletion procedures, retention period, data controller/contact, risks, benefits, eligibility and compensation, and conduct an independent privacy/security review. Do not use this prototype as a clinical or validated IQ test.

## Test steps

1. Open the Phase 2 researcher workspace, select a study, and export a server version JSON. The export must contain `snapshot` and `sha256`.
2. Open `pilot.html` in a modern browser on HTTPS or localhost (Web Crypto SHA-256 may be unavailable on some `file://` origins).
3. Import the JSON. Confirm the title, version label, item count and SHA-256 verification are shown.
4. Edit one byte in the snapshot and confirm the digest mismatch blocks administration.
5. Leave consent unchecked and confirm Start is disabled; check consent and provide a pseudonymous code to start.
6. Test previous/next navigation, answering and leaving blank, question shuffle, time limit, and auto-finish.
7. Export the result JSON. Confirm it contains the assessment version digest, item order, item-level responses, time data, consent timestamp, raw score, and no name/email/phone/address fields.
8. Confirm network activity shows no participant-response upload and refresh/restart clears the in-memory response.

## Not included

No public version retrieval, server submission, participant account, participant token, rate limiting, abuse prevention, withdrawal endpoint, data retention job, or live recruitment. Do not enable collection until those components are designed and reviewed.
