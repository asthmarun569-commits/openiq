# OpenIQ v0.5 — research-oriented prototype

OpenIQ is an experimental reasoning quiz and local research-analysis tool. It is **not a validated IQ test** and does not calculate official WAIS FSIQ, VCI, WMI, PRI/POI, PSI, or GAI scores. No accuracy percentage is established.

## v0.5 changes

- **Ambiguous PSI items revised:** visual target search uses a mutually exclusive `Present` / `Absent` key. Number comparison uses `Same` / `Different` as the only meaningful response choices; other distractors are deliberately marked as invalid-information distractors, not alternative correct statements. See limitation below.
- **WMI sequence presentation separated:** reverse-sequence items display a stimulus for three seconds, then hide it and show response choices. This is a prototype timing rule, not a standardized or validated working-memory procedure. Other mental-update items remain practice arithmetic tasks.
- **Item metadata:** each item has a stable template ID, parameter object, difficulty label, domain, and correct answer. Generated IDs are unique within a session. Parameters and difficulty are included in exported results.
- **Reproducible generator API:** `generateWithSeed(seed)` produces the same form for the same seed. The live site uses random generation.
- **Automated tests:** tests check reproducibility, domain counts, unique IDs, option uniqueness, keyed-answer consistency, metadata, PSI item rules, and separation of WMI stimulus from prompt.
- **Research Lab retained:** import downloaded JSON files locally to explore item statistics. These summaries are exploratory; many parameterized items will have low repeat counts until an item bank is deliberately calibrated.

### Important PSI limitation

The number-match task now uses exactly two mutually exclusive response choices (`Same`, `Different`). This removes overlapping distractors but does not establish that the task is a valid processing-speed measure. Target-presence items also use two response choices; other practice items use four.

## Run automated tests

Requires Node.js 18 or newer; no dependencies are required.

```bash
npm test
```

Or run directly:

```bash
node --test tests/*.test.js
```

The tests verify software behavior, not construct validity, reliability, norm quality, or IQ accuracy.

## Deploy to GitHub Pages

1. Download and extract the ZIP.
2. Open your repository: https://github.com/asthmarun569-commits/openiq
3. Upload the **contents** of the `openiq-v05` folder to the repository root, replacing the previous website files. Keep `index.html`, `styles.css`, `questions.js`, `scoring.js`, `app.js`, `research.html`, and `research.js` together. The `tests` folder and `package.json` are optional for the live website but useful for development.
4. Commit to `main` and wait for GitHub Pages to redeploy.
5. Test a full assessment on desktop and mobile. Confirm that sequence stimuli disappear after the configured three-second display, answer choices then appear, and result JSON downloads correctly.
6. Visit `/openiq/research.html` to use Research Lab.

## Research Lab

1. Obtain informed consent and follow applicable ethics/privacy requirements before collecting participant data.
2. Participants download their own JSON result files.
3. Transfer files through access-controlled storage. Do not commit participant results to GitHub or post them in public issues.
4. Open Research Lab and import the JSON files. The static page analyses them locally in the browser.
5. Export item statistics as CSV when useful. Treat findings as exploratory, especially with small or convenience samples.


### Domain reliability report (v0.5 update)

The Research Lab now includes a domain-level reliability table. It estimates KR-20 only when there are at least 10 valid reports and at least 3 exact common item IDs in that domain; otherwise it displays **Insufficient data** with the reason. These are conservative dashboard safeguards, not universal sample-size rules. The analysis deliberately does not align randomized question sets by array position, because different questions are not interchangeable. With a fully randomized bank, common-item overlap may be zero; use a fixed/calibrated anchor-item design or an appropriately designed model before estimating reliability across forms.

KR-20 is an internal-consistency estimate for dichotomously scored items. It does not estimate test–retest stability, establish that a domain measures its intended construct, or indicate IQ accuracy. Six items per domain is a short scale and estimates can be unstable. Report uncertainty and study design, and avoid using a single coefficient as a pass/fail verdict.

## Scoring and validation

The familiar transformation is:

`score = 100 + 15 * ((composite - normMean) / normSD)`

This only transforms a score onto a scale with mean 100 and SD 15. It does not make a test valid or reproduce WAIS scoring. Norms are intentionally unset unless an appropriate configuration is explicitly marked validated. Do not enter guessed means/SDs or treat a convenience sample as population norms.

Before making an IQ claim, OpenIQ needs a defined construct and population, expert review, cognitive interviews, standardized administration, item-level pilot data, reliability and validity evidence, representative age-appropriate norms, uncertainty estimates, and independent validation. For the ambitious target of estimates within a specified IQ-point margin, report the observed percentage and confidence interval from an independent validation sample; do not predict that percentage in advance.

## Privacy

The website is static. Results stay in the participant's browser until downloaded or shared by the participant. Research Lab reads files locally and does not upload them to a server. File exports omit names and emails but are not guaranteed anonymous; file metadata or combinations of responses can still be identifying. Minimize data, obtain informed consent, use secure access-controlled storage outside GitHub, set retention/deletion rules, and seek ethics guidance before human-participant research.
