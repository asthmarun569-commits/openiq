# OpenIQ: protocol for evaluating the 95% accuracy target

## Status

This is a proposed preregistration template, not evidence that OpenIQ is accurate. Do not publish an IQ score or an accuracy claim from the protocol alone. OpenIQ v0.12 remains an experimental cognitive-practice prototype until appropriate validation evidence exists.

## 1. Define the claim before collecting data

**Proposed primary outcome:** among eligible participants in the prespecified target population, the proportion whose OpenIQ score differs from an appropriate independently obtained reference score by no more than 5 points:

`within5 = abs(openiq_score - reference_score) <= 5`

**Proposed success rule:** the lower bound of a prespecified two-sided 95% confidence interval for the within-5 proportion must be at least 0.95. A point estimate of 95% is not enough. This is a very demanding criterion; calculate the sample size before recruitment and expect that substantially more than a few dozen participants may be needed.

The reference assessment must measure a compatible construct, be appropriate for the participant's age/language/population, be administered and scored independently by qualified personnel, and be used with appropriate permissions. An informal online quiz is not a suitable criterion. Reference scores also have measurement error; acknowledge this in the analysis and interpretation.

## 2. Freeze the test and analysis

Before confirmatory recruitment, archive the exact release, item bank, generator, scoring code, instructions, timing rules, and analysis script. Record cryptographic hashes in the study log if possible. Do not tune the test against the validation sample. If you change the test after examining validation outcomes, use a new independent sample for confirmation.

For the first calibration study, prefer a fixed form. If you intend to use randomized forms, establish form equivalence or a defensible linking/equating design first. A common question count is not evidence of equivalent difficulty or precision.

## 3. Define the population and administration

Pre-register:

- target age range, language(s), location/context, eligibility and exclusion rules;
- recruitment method and sample-size calculation;
- exact reference test and qualifications/permissions for its administration;
- order of administration and time interval between tests;
- device/browser/input requirements, interruption rules and accommodations;
- how incomplete sessions, duplicate attempts and missing reference scores will be handled;
- primary and secondary outcomes and all subgroup analyses.

Seek applicable ethics review before research recruitment. Use informed consent, data minimization, access controls, retention/deletion rules, and a plan to prevent participant-level data from being committed to the public repository. A participant code is pseudonymous, not anonymous.

## 4. Sample-size planning

Do not choose sample size solely from a rule of thumb. Calculate it from the desired confidence-bound or power criterion for the proportion within ±5, expected success rate, confidence level, and allowance for missing/ineligible paired observations. If the objective is to demonstrate that the true proportion is at least 95%, a study with a point estimate near 95% will generally not establish that threshold with a high-confidence lower bound. Have a statistician or psychometrician verify the plan before recruitment.

Development, calibration, norming, and independent validation serve different purposes. Do not use the same participants to tune items and then describe the results as independent confirmation. Age norms require a suitable population sample and a plan for each intended age range; this validation sample alone does not automatically create norms.

## 5. Prespecified metrics

Primary:

- proportion of eligible paired scores with absolute error <= 5;
- two-sided 95% Wilson confidence interval for that proportion (or a prespecified exact binomial interval).

Secondary:

- mean signed error (OpenIQ minus reference; positive means overestimation);
- mean absolute error (MAE);
- root mean squared error (RMSE);
- median and distribution of signed errors;
- Bland–Altman agreement analysis by a qualified analyst;
- score-level precision, reliability, and measurement error from separate appropriate studies;
- prespecified subgroup results, with uncertainty and adequate sample size.

Correlation alone is not an agreement metric: two methods can correlate highly while systematically disagreeing. Do not rely on a single overall within-5 percentage; inspect bias and error patterns across the score range and relevant groups.

## 6. Analysis and exclusions

Use one row per participant with one eligible, independently paired OpenIQ/reference score. Never include names, email addresses, phone numbers, full birth dates, or other direct identifiers in the analysis CSV. Set `eligible` to `yes` or `no` and document exclusions before examining results. Do not remove outliers merely because they reduce accuracy. Report the number recruited, excluded, missing, and analyzed, with reasons.

The included `analyze-validation.js` script computes descriptive metrics and a Wilson interval only after strict input checks. The CSV must include `openiq_score_type` and `reference_score_type`; both must be `iq` for the primary ±5 IQ-point analysis. Scores must be finite whole numbers in the protocol guard range 40–160, and `eligible` must be exactly `yes` or `no`. Confirm that this range and score format match the chosen reference assessment before preregistration; if not, change the prespecified limits in code and tests before seeing validation outcomes. Raw OpenIQ practice percentages are not IQ scores and must not be compared with IQ scores. Since norm-referenced OpenIQ scoring remains disabled, current OpenIQ outputs are not eligible for this primary IQ-point agreement analysis. The script does not perform all psychometric analyses, validate the reference assessment, establish norms, or decide whether the test is fit for use. Its output is an analysis aid, not a certification.

## 7. Release gates

Do not enable IQ-like reporting unless all gates are met for the exact released version:

1. item content and construct blueprint reviewed by qualified experts;
2. standardized administration and technically sound timing;
3. item calibration and form comparability evidence;
4. adequate reliability and score precision, with uncertainty estimates;
5. validity evidence for the intended interpretation and population;
6. suitable age norms if norm-referenced scores are reported;
7. independent validation meeting the preregistered agreement criterion;
8. fairness, accessibility, ethics, privacy, and security review;
9. independent review of the technical report and reproducible analysis.

Passing the within-5 criterion alone is not sufficient to establish validity. A test can agree with one reference measure in one sample and still have construct, fairness, or generalizability problems.

## 8. Results template

Report: release hash/version; protocol date; population; recruitment; reference assessment; sample-size rationale; number recruited/excluded/analyzed; within-5 estimate and CI; bias; MAE; RMSE; subgroup findings; missing data; limitations; deviations from protocol; analyst/reviewer roles. If the criterion fails, report the result, revise only in development data, and repeat validation on a new independent sample.
