# OpenIQ v0.11 — Remediation and Validation Plan

## Additional v0.11 changes
- User-facing results and question labels use neutral practice-category names rather than VCI/WMI/PRI/PSI acronyms. Internal codes remain in exports for continuity but must not be interpreted as validated indexes.
- Added `DOMAIN_BLUEPRINT.md` documenting current task families, construct-coverage gaps, and permitted interpretation.
- Added `ITEM_REVIEW_TEMPLATE.csv` to record content review, cognitive interviews, empirical item statistics, and keep/revise/retire decisions.

## Scope and status
This release addresses specific software/data-semantics issues found in the v0.9 source audit. It does **not** validate OpenIQ as an IQ test. It is suitable only as an experimental reasoning/practice prototype and research-development scaffold.

## Implemented in v0.11
1. **Response timing semantics:** `responseTimeMs` is measured from answer choices becoming visible until the first answer selection. Time between answer selection and pressing Next is stored separately as `timeAfterAnswerMs`.
2. **Session duration:** `sessionDurationMs` is frozen when the final response is submitted, not when the participant later downloads the report.
3. **Syllogism item identity:** removed unused numeric parameters from the generated syllogism. Semantically identical syllogism content now has a consistent item ID rather than being split into artificial variants.
4. **Difficulty transparency:** every item explicitly marks its difficulty label as `heuristic-not-empirical`. The labels are not participant-calibrated difficulty estimates.
5. **Fixed development form:** append `?mode=calibration` to the test URL to use a deterministic seed for development/calibration sessions. This creates a repeatable form, not a validated or normed form. Do not use this mode for public IQ claims.
6. **Version metadata:** result exports identify v0.11 and whether the form mode is fixed-development or randomized practice.

## Required work before any IQ-like reporting

### Gate 1 — Content and construct review
- Write a domain blueprint before authoring more items.
- Have qualified reviewers map each item to the intended construct and identify language, education, culture, motor, device, and test-taking demands.
- Conduct cognitive interviews to check how participants interpret prompts and solve items.
- Rename domains to neutral practice labels until evidence supports VCI/WMI/PRI/PSI interpretations.

### Gate 2 — Technical administration
- Test keyboard, touch, screen readers, major browsers, and common mobile/desktop sizes.
- Define and verify the timing rules; never interpret time-to-advance as response latency.
- Document interruptions, visibility changes, and incomplete sessions.
- Ensure all exports include item ID, exact form version, item-bank version, scoring version, response, correctness, and clearly defined timing fields.

### Gate 3 — Exploratory pilot
- Obtain appropriate ethics review and informed consent before research recruitment.
- Start with 10–20 usability interviews, then approximately 30–50 pilot participants to find ambiguity and technical problems.
- Treat these numbers as exploratory planning ranges, not proof of validity.
- Report item difficulty as proportion correct with confidence intervals, corrected item-total correlations, missingness, response-time distributions, and reasons for exclusions.
- Do not automatically drop items solely based on one correlation threshold; review item content and uncertainty.

### Gate 4 — Calibration and reliability
- Freeze a version and use a fixed form or planned anchor/linking design.
- Plan sample size with a psychometrician based on the intended model, precision, number of items, and subgroup goals; 300–500 is only a possible starting range for item calibration, not a universal requirement.
- Estimate reliability with confidence intervals, test–retest agreement, form equivalence, score precision, and floor/ceiling effects.
- Do not run a four-factor model unless the sample size, item design, and data quality support it. Six items per intended domain may be insufficient for strong individual-level scores.

### Gate 5 — Norms and independent validation
- Define the intended population and language before collecting norms.
- Use an appropriate sample for every intended age range; do not generalize norms from one age band to all ages.
- Compare the frozen test with a suitable, independently administered reference assessment using qualified assessors and authorized procedures.
- Pre-register the proposed 95% criterion, tolerance (e.g. within ±5 points), exclusion rules, confidence interval, bias/MAE/RMSE limits, and subgroup analyses.
- Validate on participants not used for item selection, score tuning, or norm construction. Replicate before broad claims.

## Important limitations
- A fixed seed improves reproducibility but does not make items equivalent or psychometrically valid.
- Heuristic difficulty labels are not empirical item difficulty.
- Response times can still be affected by browser/device performance, display, input method, and interruptions.
- Local JSON exports are not automatically anonymous; keep participant-level files out of public repositories and define access, retention, and deletion rules.
- Software tests do not establish reliability, validity, norms, or 95% accuracy.
