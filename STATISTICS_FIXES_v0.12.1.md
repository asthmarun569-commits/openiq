# OpenIQ v0.12.1 — validation script hardening

This maintenance update improves data-integrity handling in `analyze-validation.js`. It does not change the OpenIQ test itself and does not provide evidence of IQ-test validity.

## Changes
- Duplicate participant codes: every row using a repeated code is flagged for manual resolution; the script no longer silently keeps the first record.
- Invalid first row followed by a valid row with the same code: both are flagged as duplicates pending resolution.
- CSV parser: supports quoted commas, escaped quotes and quoted newlines; rejects inconsistent row widths, duplicate/empty headers and malformed quoting.
- Empty-analysis output includes consistent invalid-row and duplicate-code details.
- Added regression tests for the above cases.

## Test result
`npm test`: 37 tests passed, 0 failed, on the local project package. This is a local automated software result only. It is not live deployment verification or psychometric validation.

## Duplicate-code handling rule
If a participant code occurs more than once, the analysis excludes all rows with that code and reports the code and affected row numbers. The researcher must resolve the records according to the prespecified study protocol, document the decision, and rerun the analysis. Do not automatically choose the first or last record.

## Still out of scope
This script does not certify validity, establish norms, fix an inappropriate reference assessment, or make an underpowered study adequate. The within-±5 criterion and its confidence interval must be interpreted according to a prespecified validation plan.
