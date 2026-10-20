# OpenIQ Independent Validation Protocol — v0.12.6

**Status:** blank protocol template and workflow only. It is not evidence that OpenIQ is valid, normed, or accurate.

## Purpose
Compare a frozen OpenIQ version with a suitable independently administered reference cognitive assessment. Current OpenIQ raw practice percentages are not IQ scores and must not be directly compared with reference IQ points. Do not activate public IQ conversion until a defensible score interpretation, norms, and validation evidence exist.

## Before recruitment
1. Define the target population, language, intended score interpretation, sampling frame, eligibility, and exclusions.
2. Select a recognized reference assessment suitable for the population and construct. Document edition, permissions, qualifications required for administration/scoring, and standardized procedures. Do not reproduce protected items or norms.
3. Determine ethics-review requirements and obtain informed consent. Establish privacy, access, retention, and deletion procedures. Pseudonymous data are not necessarily anonymous.
4. Freeze the OpenIQ release, item bank, form, scoring, timing, device/browser conditions, and analysis code. Record version and hashes.
5. Pre-register the sample-size calculation, split plan, outcomes, confidence-interval method, exclusions, missing-data rules, and subgroup analyses.
6. Separate calibration/development participants from confirmatory validation participants before examining outcomes. Do not tune the mapping or exclusions on the validation sample.

## Primary agreement endpoint
Only when both scores are defensible, comparable IQ-point scores: `abs(OpenIQ score - reference score) <= 5`. A proposed stringent criterion is a lower bound of a prespecified two-sided 95% confidence interval for the within-5 proportion of at least 95%. This requires a formal sample-size/power or precision analysis; the website's minimum row-count checks are not a sample-size justification.

## Secondary analysis
Report mean signed error (OpenIQ minus reference), MAE, RMSE, score-range error patterns, and prespecified subgroup estimates with uncertainty. Correlation alone is insufficient to establish agreement. Account for reference-test measurement error and discuss whether the reference measure is appropriate for the intended claim.

## Reporting
Report protocol/version, sample and recruitment method, number approached/enrolled/excluded/analyzed, exclusion reasons, reference assessment and administration, missingness, all prespecified metrics with confidence intervals, subgroup limitations, deviations, and independent reviewer. A successful within-5 result alone does not establish construct validity, representative norms, test–retest reliability, fairness, or generalizability.

## Release gate
Keep IQ conversion disabled until expert content review, standardized administration, item calibration, reliability/precision evidence, suitable norms for the intended population, independent validation, fairness/accessibility review, privacy/ethics review, and independent technical review are complete for the exact release.
