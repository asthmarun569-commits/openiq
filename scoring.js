/* OpenIQ research scoring module.
 * This does NOT reproduce WAIS scoring. Do not enable an IQ-like score until
 * norms are estimated from an appropriate sample and the composite is validated.
 */
(() => {
  "use strict";
  const CONFIG = Object.freeze({
    version: "0.3.0",
    status: "experimental",
    // Intentionally null: replace only with documented estimates from your
    // own representative, age-appropriate norming study.
    norms: Object.freeze({
      adults18to35: Object.freeze({ compositeMean: null, compositeSD: null, sampleSize: null, validated: false })
    })
  });

  function deviationScore(composite, norm) {
    if (!norm || norm.validated !== true) {
      return { available: false, label: "Experimental raw score only", reason: "No validated norm group is configured." };
    }
    const { compositeMean, compositeSD, sampleSize } = norm;
    if (![composite, compositeMean, compositeSD, sampleSize].every(Number.isFinite) || compositeSD <= 0 || sampleSize < 100) {
      throw new Error("Invalid norm configuration: check mean, SD, sample size, and composite score.");
    }
    const z = (composite - compositeMean) / compositeSD;
    return {
      available: true,
      score: Math.round(100 + 15 * z),
      label: "OpenIQ norm-referenced composite (research estimate)",
      method: "100 + 15 × ((composite − norm mean) / norm SD)",
      normSampleSize: sampleSize,
      clinicalIQ: false,
      waISFSIQ: false
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
