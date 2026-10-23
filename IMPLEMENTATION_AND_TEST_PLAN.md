# Implementation and Test Plan

## What changed in the HTML

- Adds editorial item review status: Draft, Under review, Approved for pilot, Rejected.
- Adds reviewer identifier, review date, and review rationale fields to each item.
- Adds a local frozen-snapshot workflow gated on all items being approved for pilot and having review metadata.
- Captures the exact question content, answer keys, item order, timing, shuffle setting, scoring rule, and version label at the beginning of each assessment attempt. The exported result contains this snapshot.
- Uses Fisher–Yates for item-order shuffling rather than `sort(() => Math.random() - .5)`.
- Keeps raw score reporting and the no-IQ-score disclaimer.
- Keeps the existing Supabase question-bank functionality and Gemini function URL.
- Adds explicit wording that participant research collection is not enabled in this static build.

## Before replacing the live page

### Functional tests

- [ ] Open the HTML on a desktop and a phone-sized viewport.
- [ ] Consent unchecked: assessment start remains disabled.
- [ ] Consent checked: start works and all active questions can be answered.
- [ ] Test untimed and timed attempts, including time expiry with unanswered items.
- [ ] Confirm results use the attempt's frozen items even if the editor is opened after starting.
- [ ] Export a result JSON and verify it includes item IDs, selected options, answer keys, item order, settings, and version metadata.
- [ ] Export/import the question bank and check review fields survive the round trip.
- [ ] Try creating a snapshot with draft items; it must be blocked.
- [ ] Mark all items approved for pilot and add reviewer, date, and rationale; snapshot creation should succeed.
- [ ] Export a snapshot and inspect its question content and checksum note.
- [ ] Check that the Gemini URL is unchanged and AI generation still handles errors.
- [ ] Test Supabase sign-in, load, save, sign-out, and account isolation using test accounts.

### Database tests after migration

- [ ] Verify RLS is enabled on all five new tables.
- [ ] Verify anonymous (`anon`) requests cannot select, insert, update, or delete rows.
- [ ] Verify an authenticated user can access only rows with their own `owner_id`.
- [ ] Verify an assessment version cannot be updated or deleted.
- [ ] Verify a response cannot reference another owner's study or version.
- [ ] Verify response-item rows cannot be attached to another owner's response.
- [ ] Verify no service-role key is present in HTML or browser JavaScript.
- [ ] Review Supabase logs and policies before any real research use.

## Known limitations

- Local snapshots are not a tamper-proof server archive and are not digitally signed.
- The HTML's editorial status fields are not yet wired to the server-side review-event table.
- The server-side immutable version table is not yet connected to the snapshot button.
- Participant-facing consent/protocol and response submission are intentionally not implemented; public participant inserts are disabled in SQL.
- No automated unit, browser integration, accessibility, penetration, or psychometric tests were run as part of this file preparation.
