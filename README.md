# OpenIQ combined update package

This folder combines the main website file with the scientific/empirical update support files.

## Included
- `index.html` — updated website preview with the PSI-003 answer correction, stricter question validation, and an in-browser exploratory pilot-analysis panel.
- `index.original.html` — backup of the main HTML source used to build this package.
- `build-full-index.mjs` — generator intended to fetch the latest public GitHub source and create a fresh updated HTML file when run with internet access and Node.js 18+.
- `apply-empirical-update.mjs` — local-source patch script; run it in a folder containing `index.html`. It creates `index.empirical.html` and will not overwrite the original.
- `pilot-response-template.csv` — blank response-data template.
- `docs/PILOT_PROTOCOL.md` — pilot-study and privacy protocol.
- `STATUS.md` — status and limitations.

## Review before publishing
1. Open `index.html` locally and test it on desktop and mobile.
2. Test the assessment, question editor, import/export, result export, and pilot CSV analysis.
3. Review the code and compare it against the current GitHub `main` branch before replacing the live website.
4. Upload the reviewed `index.html` to a new branch and test the deployment before merging.

**Source note:** Network access was unavailable while this package was assembled, so the updated `index.html` was generated from the local OpenIQ source file included as `index.original.html`. Compare it with the live GitHub `main/index.html` before deployment to avoid overwriting newer changes.

## Scientific boundary
The pilot panel calculates exploratory item difficulty, corrected item-total correlations, missingness, and KR-20 from participant data entered by the site operator. These values do not establish validity, fairness, population norms, diagnosis, or IQ measurement. No participant dataset or empirical findings are included.
