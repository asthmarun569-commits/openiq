# Research Protocol Checklist — Complete Before a Pilot

This is a planning checklist, not ethics approval or legal advice.

## Study purpose and design

- [ ] State the research question and intended score interpretation.
- [ ] Define each target construct and map every item to a construct.
- [ ] Define inclusion/exclusion criteria and justify the sample.
- [ ] Determine whether institutional ethics review or another formal approval is required in the jurisdiction and setting.
- [ ] Specify procedures, duration, risks, benefits, and researcher contact details.
- [ ] Pre-specify data-quality exclusions and statistical analyses before reviewing outcomes.

## Consent and participant rights

- [ ] Write clear consent language for the exact study.
- [ ] Explain that OpenIQ is experimental and not a validated IQ test.
- [ ] Explain what is collected, why, who can access it, and where it is stored.
- [ ] Explain voluntary participation, stopping, withdrawal, and deletion limits.
- [ ] Set a retention period and deletion procedure.
- [ ] Provide an accessible contact channel for questions or concerns.
- [ ] Do not collect names, email addresses, phone numbers, or other direct identifiers unless justified and separately protected.

## Measurement and analysis

- [ ] Obtain independent review of item wording, answer keys, fairness, accessibility, and construct alignment.
- [ ] Pilot test the procedure before the main sample.
- [ ] Define reliability and validity analyses appropriate to the design.
- [ ] Define measurement uncertainty and any missing-data treatment.
- [ ] Plan subgroup/fairness analyses where sample size and design support them.
- [ ] Define the population before developing any norms.
- [ ] Arrange independent psychometric review before making IQ-related claims.

## Security and operations

- [ ] Review Supabase RLS and privileges with separate test accounts.
- [ ] Build a server-side participant submission endpoint; do not accept public inserts directly from a static client.
- [ ] Add rate limiting, input validation, abuse monitoring, and error logging without recording unnecessary participant data.
- [ ] Verify the server associates each response with the correct study and immutable assessment version.
- [ ] Test withdrawal/deletion and retention jobs.
- [ ] Test export for accidental identifiers and re-identification risks.
- [ ] Document backup, incident response, and access revocation.
