/* OpenIQ research scoring module.
 * This does NOT reproduce WAIS scoring. Do not enable an IQ-like score until
 * norms are estimated from an appropriate sample and the composite is validated.
 */
(() => {
  "use strict";
  const CONFIG = Object.freeze({
    version: "0.11.0",
    status: "experimental",
    // Intentionally null: replace only with documented estimates from your
    // own representative, age-appropriate norming study.
    norms: Object.freeze({
      adults18to35: Object.freeze({ compositeMean: null, compositeSD: null, sampleSize: null, validated: false })
    })
  });

  function deviationScore(composite, norm) {
    // Hard-disabled in this public prototype. A boolean flag and sample-size
    // threshold are not sufficient evidence for valid age norms or an IQ score.
    return {
      available: false,
      label: "Experimental raw score only",
      reason: "Norm-referenced scoring is disabled until an independently reviewed norming and validation study is documented for this exact test version."
    };
  }

  function standardErrorOfMeasurement(sd, reliability) {
    if (!Number.isFinite(sd) || sd <= 0 || !Number.isFinite(reliability) || reliability < 0 || reliability > 1) {
      throw new Error("Provide a positive score SD and a reliability between 0 and 1.");
    }
    return sd * Math.sqrt(1 - reliability);
  }

  window.OPENIQ_SCORING = Object.freeze({ CONFIG, deviationScore, standardErrorOfMeasurement });
})();
