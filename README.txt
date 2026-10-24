OpenIQ 2.5 — Deviation-IQ formula implementation

Contents: index.html

The conventional deviation-IQ formula is implemented in calculateDeviationIQ(rawScore): IQ = 100 + 15*z, where z=(X-mu)/sigma. The output remains intentionally locked because IQ_NORM_CONFIG.validated is false and no approved norm parameters exist. Do not enable this by inserting convenience-sample statistics.

Before any IQ-type output is released, a qualified psychometrician and the responsible research institution must approve the norm population, sampling design, score model, reliability/validity/fairness evidence, measurement precision, and release documentation. This is a prototype, not a validated IQ test or independent certification.

Deployment: replace your repository's index.html with this file, commit it, and test the published site.
