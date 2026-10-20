# OpenIQ v0.13 — Content expansion blueprint (development only)

**Status:** design specification and draft-item bank. This is not a validated test, not an IQ test, and not an approved norming instrument. Existing live site is not changed by this package.

## Intended use and construct boundary

Until a psychometrician defines a narrower construct and reviews the blueprint, OpenIQ should be described as a **multidomain cognitive-task practice prototype**. Do not label the current four UI categories as validated VCI/WMI/PRI/PSI scales. Do not report FSIQ, percentiles, diagnostic conclusions, or age-adjusted scores.

## Candidate content matrix

Use a fixed pilot form before experimenting with random forms. The matrix below is a *content sampling plan*, not a claim that each family measures an independent cognitive ability.

| Candidate family | Example task format | Main contamination risks | Review gate |
|---|---|---|---|
| Word meaning | Common-word synonym / contextual meaning | Language, literacy, schooling, translation | Native-language expert review; avoid obscure vocabulary |
| Verbal relations | Complete a simple relationship analogy | Familiarity with examples, ambiguity | Independent reviewers agree on one best answer |
| Deductive reasoning | Conclusions from explicitly stated premises | Reading load, prior knowledge | Key follows only from premises, not real-world assumptions |
| Quantitative relations | Number relations and arithmetic rules | School curriculum, numeracy | Check arithmetic, alternative rules, distractor plausibility |
| Quantitative word problems | Short everyday-neutral quantitative scenario | Reading comprehension, cultural familiarity | Keep wording minimal; no specialized knowledge |
| Visual-spatial relations | Rotation / reflection / part-whole using controlled graphics | Display size, rendering, visual impairment | Verify assets at phone/desktop sizes and with accessibility review |
| Pattern induction | Multiple rule types, not arithmetic sequences alone | Test-wiseness, over-representation of one strategy | Include rule variety; document intended rule and alternatives |
| Short-term retention | Recall / reorder short sequences after fixed exposure | Device, language, rehearsal strategies | Fixed stimulus, exposure, mask, response window and scoring |
| Mental updating | Apply a small number of updates to a starting value | Arithmetic fluency, working strategy | Exact steps; no ambiguous order; pilot load and floor/ceiling |
| Selective attention | Target detection among distractors | Screen, contrast, motor/input speed | Do not interpret browser latency as standardized processing speed |

**Initial pilot allocation proposal:** 40 items across these 10 families (4 per family), with one fixed form and balanced key positions. This is for content/pilot analysis only; 40 items does not itself establish reliability, validity, or a normed score. If visual-spatial assets cannot be delivered consistently across devices, keep that family out of scored totals until standardized.

## Draft-item acceptance rubric

For every item version, two independent reviewers should rate (1) construct relevance, (2) clarity, (3) unique key, (4) distractor quality, (5) language/cultural load, (6) accessibility/device dependence, (7) expected difficulty rationale, and (8) explanation accuracy. Record disagreements and revisions. An item cannot be called “carefully reviewed” until named qualified reviewers have actually completed the review; this document supplies criteria, not external expert sign-off.

## Item lifecycle

1. Draft multiple candidate items per family.
2. Verify key independently; test all numeric cases and option uniqueness automatically.
3. Conduct cognitive interviews with people from the intended population; ask how they understood and solved the item.
4. Revise language and accessibility issues before quantitative piloting.
5. Pilot a frozen form; report item difficulty with uncertainty, missingness, distractor choices, response-time distributions and corrected item-total statistics only as exploratory indicators.
6. Review differential item functioning / subgroup differences with appropriate expertise and sample size before retention.
7. Freeze form and scoring before confirmatory validation. Changes after validation outcomes require a new independent confirmation sample.

## Do not do

- Do not infer empirical difficulty from labels such as easy/moderate/challenging.
- Do not randomize a new form per user and compare raw percentages as equivalent.
- Do not create IQ points from raw percentage, z-scores, or a convenient linear fit without a defensible measurement model, suitable norms and independent validation.
- Do not use synthetic responses as participant evidence.
