# OpenIQ Editable Recovery Build

This is a standalone, editable practice-assessment prototype intended to be easy to correct from a phone or computer.

## Included
- One-file HTML application; no build tools or third-party libraries.
- 12 demonstration reasoning questions.
- Consent acknowledgement before starting, question progress, previous/next navigation, raw score, domain breakdown, answer review and JSON result export.
- Editor for question text, item IDs, domain, difficulty label, four options, correct answer key and explanation.
- Question-bank validation, JSON import/export and CSV export.
- Explicit privacy notice: no network calls, no Supabase integration, no silent uploads.
- No IQ conversion, norms, percentile or validity claim.

## Run
Open `index.html` in a modern browser. For GitHub Pages, place this file at the repository root as `index.html`.

## Edit safely
1. Open Question editor.
2. Make changes and choose Validate question bank.
3. Choose Apply edits.
4. Open Import / export and export a JSON backup before closing or replacing the file.
5. Imported JSON must contain a `questions` array or be an array of questions. Each item requires `id`, `domain`, `prompt`, exactly four non-empty `options`, and an integer `answer` from 0 to 3.

## Important limitations
This is not the original v0.13.1 source restoration and does not recreate every historical page or external integration. It is a new recovery build based on the known current prototype requirements. It does not connect to Supabase or persist participant answers. Demo questions and scoring are illustrative and have not been psychometrically validated. Do not use results as an IQ estimate or for high-stakes decisions.


## What is included in this updated edition
- Report-style validation dashboard with current evidence status, staged study plan, release checklist, and a proposed (not achieved) 95% accuracy criterion.
- Complete practice flow: consent acknowledgement, optional participant code, timed or untimed assessment, progress, answer review, raw domain results, and JSON export.
- Editable question bank and JSON/CSV import/export.
- Mobile-friendly light professional layout.

The 95% criterion is a proposal only. This build has not been psychometrically validated and does not calculate an IQ score. The website remains local-only and is not connected to Supabase.


## Unlimited question-bank setup update
The editor now supports batch-adding blank questions, custom default domains, and longer time limits up to 120 minutes. The app imposes no fixed question-count cap, but very large banks can be limited by the phone/browser memory. Fill in question prompts/options/keys, validate, apply edits, and export JSON backups.
