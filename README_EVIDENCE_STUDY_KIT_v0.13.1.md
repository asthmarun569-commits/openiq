# OpenIQ v0.13.1 Evidence Study Kit
Start with `EVIDENCE_STUDY_PROTOCOL_v0.13.1.md`. Use blank templates for genuine consented data. The simulated file is ineligible and rejected by design.

Run: `python3 analyze_paired_evidence.py PAIRED_REFERENCE_DATA.csv`

This is a basic data guard, not a complete psychometric validation system. It accepts only records marked eligible=yes, both score types `iq`, qualified reference administration, an instrument code, and non-synthetic participant codes.
