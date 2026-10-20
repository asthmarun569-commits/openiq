# OpenIQ empirical item calibration workflow (v0.12.3)

## What this does

The Research Lab calculates exploratory classical-test-theory summaries from real OpenIQ JSON exports: item difficulty (proportion correct), Wilson 95% intervals, corrected within-domain item-total correlation, response latency, and a provisional review prompt. It does not automatically delete items, create IQ scores, establish norms, or prove validity.

## Fixed form

Use `index.html?mode=calibration` for the same deterministic development form. Before collecting data, freeze the deployed code and record the exact version/commit, item order, instructions, timing, eligibility rules, and analysis plan. Do not mix records from different versions or randomly generated forms in one item-level calibration cohort. The fixed form is a development/calibration form, not a validated assessment.

## Collection steps

1. Obtain appropriate consent and any required ethics/privacy approval before collecting responses.
2. Use adults in the intended initial population (18+, English), and document recruitment method and exclusions. Convenience samples do not establish representative norms.
3. Have each participant complete the same fixed form under the same instructions and device/timing conditions as far as practical.
4. Download each participant's JSON export. Keep participant codes pseudonymous; do not commit participant-level data to public GitHub or publish identifying details.
5. Import the real JSON files in `research.html`. Export the item CSV and preserve the anonymized analysis output and version metadata.
6. Review every item alongside the statistics: answer-key correctness, ambiguity, language/education load, accessibility, distractor quality, timing, and subgroup patterns. Do not automatically remove an item solely because of one statistic.

## Interpreting the prompts

- Difficulty is the observed proportion correct. It depends on the sample and administration conditions.
- Wilson intervals communicate uncertainty in the difficulty estimate.
- Corrected item-total correlation is an exploratory discrimination indicator; negative or weak values prompt review, not automatic deletion.
- The dashboard uses N=30 only as a minimal screening guardrail and aims to make low-N uncertainty obvious. This is not a universal psychometric standard. Prefer substantially larger item samples (often 100+ per fixed item as an initial planning target) and formal sample-size planning for intended decisions.
- A wide interval, low sample, unusual timing, or unexpected subgroup difference requires follow-up.
- KR-20 is only a preliminary internal-consistency estimate under its assumptions. It is not test-retest reliability, construct validity, or IQ accuracy.

## What empirical calibration still requires

Item review and pilot statistics are only the first stage. A defensible instrument requires a clearly defined construct and content blueprint, item-level data of adequate quality and size, evidence of reliability/measurement precision, a suitable independent reference assessment, validity evidence, representative age-appropriate norms, fairness/accessibility checks, and independent validation. Do not enable norm-referenced IQ conversion or claim 95% agreement within ±5 IQ points until that evidence exists.

## Do not fabricate data

Synthetic data may be used to test the software pipeline only. It must never be mixed with real pilot data or used to claim empirical item difficulty, reliability, norms, or validity.


## Reliability and measurement precision (v0.12.4 workspace)

The Research Lab reports exploratory KR-20 only for identical item IDs administered to every included report, plus raw-score standard deviation and SEM = SD × √(1 − KR-20). Participant-level bootstrap intervals are shown only for at least 30 complete reports and adequate bootstrap estimates. These are approximate intervals and do not correct convenience-sample bias. They are not IQ-point intervals. Do not interpret a single internal-consistency coefficient as validity or test–retest reliability. For temporal stability, plan a separate repeat-administration study with a prespecified interval and stable participant codes; this version does not estimate test–retest reliability from a single administration.
