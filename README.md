# OpenIQ v0.13.0 — experimental research prototype

OpenIQ is an experimental reasoning quiz and local research-analysis tool. It is **not a validated IQ test**. It does not calculate official WAIS FSIQ or validated VCI, WMI, PRI/POI, PSI, or GAI scores. No IQ-accuracy percentage is established.


## v0.13.0 — content, standardization and norming work package

This package adds `CONTENT_BLUEPRINT_v0.13.md`, `STANDARDIZATION_SPEC_v0.13.md`, `NORMING_AND_VALIDATION_PLAN_v0.13.md`, `TARGET_POPULATION_DECISION_v0.13.md`, and blank review/QA CSV templates. These are implementation specifications and research planning documents; they do **not** mean the live website has been updated, the timing defect is fixed, experts have signed off, or norms/validation exist. The intended norm population must be defined before norming recruitment. Keep IQ conversion disabled.

The timer checklist is ready for a tester to record observed behavior. The reported navigation/timing failure has not been reproduced against the live deployed source in this package, so no fix is claimed.

## Prior v0.9 corrections retained

- Timed working-memory practice items now include both reverse-sequence and mental-update tasks. The information is shown for a configured 3,000 ms, then hidden before response choices appear. This is an experimental delivery rule, not a standardized working-memory procedure.
- PSI target symbols remain visible while the question is answered; PSI items do not inherit the WMI timed-hide behavior.
- Response-time measurement starts when answer options appear and resets when a new question is rendered, rather than carrying elapsed time forward from the previous question.
- The progress bar reflects the currently displayed question.
- Result exports include app/generator/scoring versions, a form identifier, and item presentation timing metadata.
- Norm-referenced score conversion is hard-disabled in the public prototype. Supplying a mean, SD, sample size, or a `validated` flag cannot enable it.
- Added `quality.html`, an eight-element audit explaining what is implemented, what remains unproven, and the release gates.
- Added regression tests for the timed WMI tasks and scoring guardrail.

These are software corrections. They do not establish that the tasks measure the named cognitive constructs or that OpenIQ estimates IQ.

## Eight essential elements: current status

1. **Scientific test design:** partial. Items have IDs and keys, but the bank needs expert content review and cognitive interviews.
2. **Psychometric validation:** not established. The Research Lab's item difficulty, corrected item-total correlation, and KR-20 are exploratory only.
3. **Norms and scoring:** not established. Norm-referenced scoring is disabled. A raw percentage is not an IQ score.
4. **Test delivery:** basic browser delivery. WMI stimuli use a 3-second prototype presentation; timing and device effects require study. PSI is not standardized speed testing.
5. **Results reporting:** raw correct count and percentage only, with explicit non-IQ language and versioned export metadata.
6. **Security and privacy:** static local-only processing; exports are participant-controlled but may contain identifying combinations. Client-side answer keys are inspectable.
7. **Ethics and fairness:** basic optional research consent exists. Applicable ethics review, recruitment safeguards, accessibility, and subgroup comparability remain to be established.
8. **Quality assurance:** automated regression tests are included; these test software behavior, not validity or reliability.

See `quality.html` for the full audit and validation gates. `DOMAIN_BLUEPRINT.md` defines the current practice categories and limitations; `ITEM_REVIEW_TEMPLATE.csv` provides a review record for each item version. The UI now uses neutral practice-category labels rather than displaying index acronyms as if they were validated scales.

## Run tests

Requires Node.js 18 or newer. No external packages are required.

```bash
npm test
```

Tests cover generator reproducibility, item-key consistency, stimulus timing metadata, consent/export behavior, and scoring safeguards. Passing tests do not validate the assessment.

## Deploy to GitHub Pages

1. Extract the v0.11 ZIP.
2. Open the `openiq-v12` folder.
3. Upload the **contents** of that folder to the root of `https://github.com/asthmarun569-commits/openiq`, replacing the old website files.
4. Commit to `main` and wait for GitHub Pages to redeploy.
5. Check the full test flow on mobile and desktop, including WMI stimulus hiding, PSI symbol visibility, response-time exports, result download, Research Lab, and `quality.html`.

Keep `index.html`, `styles.css`, `questions.js`, `scoring.js`, `app.js`, `research.html`, `research.js`, `pilot.html`, and `quality.html` together in the repository root. The `tests` directory and `package.json` are for development and are optional for the live site.

## Empirical item calibration workflow

See `EMPIRICAL_ITEM_CALIBRATION_GUIDE.md`. Use `index.html?mode=calibration` so all participants receive the same deterministic development form, then import only real, consented JSON exports into `research.html`. The lab adds provisional item-review prompts to empirical difficulty, uncertainty, corrected item-total relationship, and timing summaries. These are exploratory statistics, not an automatic calibration decision or proof of IQ validity. Never mix synthetic and real records.

## Research Lab limitations

The Research Lab analyses imported JSON files locally in the browser. Item difficulty is the proportion correct, with a Wilson interval. Corrected item-total correlation is an exploratory indicator. KR-20 is withheld unless exact common item IDs and minimum dashboard safeguards are present. These thresholds are dashboard guardrails, not universal psychometric standards. Randomized forms are not automatically comparable.

## Research and privacy requirements

Before recruiting research participants, write a protocol, confirm applicable ethics-review requirements, obtain informed consent, define access controls and retention/deletion rules, and protect raw result files. Never commit participant-level data to the public repository. A participant code is pseudonymous, not anonymous.

For credible IQ-like interpretation, OpenIQ still needs a defined target population and construct, expert item review, standardized administration, calibration, reliability and validity evidence, suitable age norms, measurement-error estimates, and independent validation against an appropriate reference assessment. A proposed 95% within-±5-point target must be tested on a preregistered independent sample with a confidence interval and other agreement metrics; it must not be claimed in advance.


## v0.12.3 validation toolkit notes
See `VALIDATION_REMEDIATION_PLAN.md` for the staged solution plan. The `?mode=calibration` URL query enables a deterministic development form; it is not a validated assessment or normed IQ test. Exports now separate first-answer response latency from time-after-answer and freeze session duration at final submission. Heuristic difficulty labels are explicitly identified as non-empirical.

## v0.12.3: 95% accuracy validation toolkit

`VALIDATION_95_PROTOCOL.md` provides a proposed preregistration protocol for the target of at least 95% of eligible scores within ±5 points of an appropriate independent reference score. It describes population definition, frozen releases, sampling, primary/secondary metrics, ethics, and release gates.

`validation-data-template.csv` is a de-identified data template. Do not put names, email addresses, exact birth dates, or other direct identifiers into it, and do not commit real participant-level data to this public repository.

After copying the template and filling it with appropriately collected real paired data, run:

```bash
node analyze-validation.js validation-data.csv
```

The script reports the within-5 proportion and Wilson 95% interval, signed bias, MAE, RMSE, and age-band summaries. It is a descriptive analysis aid, not a complete psychometric analysis or certification. It does not make the site an IQ test and cannot establish accuracy without a suitable reference assessment and a sound independent study design.


### Validation analysis input safeguards (v0.12.3)

The validation CSV must declare `openiq_score_type` and `reference_score_type`. The primary ±5 IQ-point analysis accepts only `iq`/`iq` pairs with whole-number scores in the prespecified 40–160 guard range. Current OpenIQ outputs are raw practice scores, not IQ scores, so they must not be represented as IQ scores; the formal primary agreement analysis remains blocked until a valid, appropriately normed score exists. See `SCORE_VALIDATION_v0.12.3.md`.


### Reliability / measurement precision workspace
The Research Lab computes exploratory KR-20 and raw-score SEM only for common item sets, with approximate participant-bootstrap intervals when there are at least 30 complete reports. It does not estimate test–retest reliability from one administration, and these statistics do not validate IQ scores.


## v0.12.5 — Norm-reference conversion research test

Open `norm-reference-test.html` to run an exploratory held-out conversion test from OpenIQ raw scores to independently obtained reference assessment scores. The CSV requires `participant_code,openiq_raw_score,reference_iq,age_band,split`, with prespecified `calibration` and `validation` splits. A linear mapping is fitted only on calibration rows and evaluated on held-out validation rows using bias, MAE, RMSE, proportion within ±5 points, and a Wilson 95% interval.

**This does not enable IQ reporting.** The output is an exploratory mapping for research review, not an approved norm-referenced IQ conversion. A 30+30 software minimum is only a guard and is not a statistical sample-size justification. Suitable reference assessments, representative sampling, prespecified study design, age norming, independent replication, reliability, validity, fairness and ethics/privacy review remain necessary. Use only real, consented data; never use synthetic rows as evidence.


## v0.12.6 — Independent validation workflow

Open `independent-validation.html` for a study readiness checklist and downloadable blank protocol record. `INDEPENDENT_VALIDATION_PROTOCOL_v0.12.6.md` documents the design and release gates. This is a research workflow only: no independent validation has been performed, and public IQ conversion remains disabled. The existing conversion research page is exploratory and cannot replace an appropriate reference assessment, a preregistered study, suitable norms, or independent review.
