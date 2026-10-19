# OpenIQ — Reasoning Assessment Prototype

OpenIQ is a beginner-friendly, static website starter for an AI-assisted cognitive reasoning project. It runs with plain HTML, CSS and JavaScript, so no build tools or backend are required.

## Important scientific limitation

**This prototype does not measure or report IQ.** Its original sample questions are illustrative and have not been validated by a psychometric study. A raw percentage correct cannot be converted into IQ by applying a formula such as `100 + 15 × z` unless a suitable, representative norm sample and valid measurement model support that conversion.

Do not use this prototype for diagnosis, employment, admissions, or other high-stakes decisions.

## Files

- `index.html` — page structure and consent notice
- `styles.css` — responsive styling
- `questions.js` — sample question bank and answer keys
- `app.js` — navigation, scoring, review and local download

## Run locally

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Tick the limitation acknowledgement and start the quiz.

No install step is needed.

## Publish with GitHub Pages

1. Create a new public repository on GitHub, for example `openiq`.
2. Upload all four website files and this README to the repository's root.
3. Open **Settings → Pages**.
4. Under the build/deployment source, select **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then save.
6. Wait for GitHub Pages to publish. Open the URL shown in Settings → Pages.

The published site may take a few minutes to appear. If you change files, commit the changes and wait for the next deployment.

## Before inviting people to take the test

### A. Verify software correctness

- Check every answer key independently.
- Test previous/next navigation and answer changes.
- Check unanswered questions cannot be skipped.
- Check all 12 questions and the final score.
- Test at phone and desktop widths, keyboard navigation and a screen reader.
- Test browser refresh, offline loading and supported browsers.
- Consider adding automated tests for the scoring function.

Passing these checks only establishes that the software behaves as designed.

### B. Investigate psychometric validity

A defensible IQ interpretation requires more than a working app. A research plan should include:

1. A clear definition of the construct and intended population.
2. Expert review of content and potential sources of bias.
3. A pilot sample recruited with informed consent.
4. Item difficulty, item discrimination and missing-response analysis.
5. Reliability estimates with uncertainty.
6. Factor-structure evidence and relevant validity evidence.
7. Comparison with an appropriate established assessment administered under suitable conditions.
8. Representative norms for the population and age groups for which scores will be reported.
9. Fairness analyses and documentation of limitations.

Seek advice from a qualified psychometrician or academic psychology department before describing the result as an IQ score. Sample sizes depend on the test design, model, subgroups and intended precision; do not treat a single fixed number as a universal threshold.

## Privacy

This starter does not send answers to a server or create user accounts. The user-triggered download saves a result file locally. If you later add analytics, accounts, remote storage or research data collection, update the privacy notice, obtain appropriate informed consent, minimise collected data, secure it, and provide a retention/deletion plan. Do not collect identifiable or sensitive data unless necessary and properly governed.

## Item licensing

The sample questions in this starter were written for demonstration. When using external test items, datasets, illustrations or validated instruments, check their specific licence and permission requirements. Do not copy proprietary questions from commercial assessments.

## Suggested next milestones

- [ ] Add automated tests for scoring and navigation.
- [ ] Have reviewers check each item for ambiguity and correctness.
- [ ] Write a preregistered pilot-study plan before collecting research responses.
- [ ] Add an explicit, optional consent flow before any research data is collected.
- [ ] Analyse anonymised pilot data using suitable psychometric methods.
- [ ] Publish a technical report that separates evidence from assumptions.
