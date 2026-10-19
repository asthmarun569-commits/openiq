# OpenIQ v0.12.2 — strict score validation

## Changes
- Require `openiq_score_type` and `reference_score_type` columns.
- The primary ±5 IQ-point analysis accepts only rows explicitly marked `iq` for both scores.
- Reject missing, non-finite, fractional, and out-of-range scores. Default protocol guard is whole-number IQ scores from 40 to 160; confirm the range matches the chosen reference assessment before preregistration.
- Require `eligible` to be exactly `yes` or `no`; invalid flags are not silently treated as exclusions.
- Preserve duplicate-code flagging across all rows.
- Update validation template and add regression tests.

## Important scientific limitation
OpenIQ currently produces raw experimental practice scores and has norm-referenced IQ scoring disabled. Therefore, current OpenIQ results cannot be entered as `openiq_score_type=iq` or compared with an IQ reference score for the ±5 IQ-point target. The analysis will reject raw percentages for that primary outcome. This is intentional: changing the label does not convert a raw score into a valid IQ score.

## Verification
All 43 local automated tests passed on the included project. This verifies code behavior only; it does not establish psychometric validity or verify a live deployment.
