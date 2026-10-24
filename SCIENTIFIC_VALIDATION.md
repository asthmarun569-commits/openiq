# OpenIQ scientific validation plan

## Current permissible interpretation

OpenIQ is an experimental reasoning assessment prototype. Current outputs are raw performance on a selected item set. They are not an IQ score, diagnosis, percentile, measure of general intelligence, or basis for hiring, education, or clinical decisions.

## Before recruitment

Write a study protocol that specifies intended population, language, age range, accessibility needs, research question, exclusions, sample-size rationale, stopping rule, primary/secondary outcomes, missing-data handling and analysis plan. Consent language must state purpose, data collected, retention, withdrawal, contact route and that the assessment is not validated.

## Item review and versioning

For every item record a stable ID, item revision, domain rationale, intended cognitive process, hypothesized difficulty, answer key, explanation, language/cultural assumptions, accessibility notes, source/author and reviewer decision. Obtain independent review for ambiguity, answer correctness and domain alignment. Freeze the item-bank snapshot and hash for every session; do not edit items mid-study without creating a new version.

## Pilot outcomes

Review completion rate, missing responses, item difficulty (proportion correct), distractor functioning, response times, technical failures and participant feedback. Report sample recruitment and uncertainty. Small convenience samples are exploratory and cannot establish population norms.

## Reliability and validity

Choose analyses that fit the test and data. Possible approaches include test-retest stability, internal consistency where assumptions fit, item discrimination, factor structure, convergent/discriminant evidence and differential item functioning where sample size permits. Report confidence intervals, assumptions, exclusions, negative findings and limitations. A high reliability coefficient alone does not establish validity.

## Order-effect experiment

If comparing Standard, Hard-to-Easy and Random modes, define the hypothesis and primary outcome in advance. Use the same frozen item pool and scoring rules across conditions. Record condition, item order, version hash and randomization seed. Define assignment and handling of repeat attempts. The current pilot runner only shuffles when the frozen snapshot requests it; it does not yet provide three named modes. Implement and test these modes as a separate versioned feature before treating ordering as an experiment.

## Norming

Do not convert percentage correct to IQ. Norm-referenced scoring requires a sufficiently large, relevant and representative reference sample, standardized administration, a defensible scoring model and independent psychometric review. Keep IQ conversion disabled unless that evidence supports it.
