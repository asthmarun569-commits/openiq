# OpenIQ production security checklist

- [ ] Base and hardening migrations reviewed and applied in staging.
- [ ] RLS enabled on all research tables; direct browser insert/update/delete policies removed.
- [ ] RPC execute privilege restricted to `service_role`; no service-role key in browser code or Git history.
- [ ] Edge Function JWT verification enabled and access token verified with Supabase Auth.
- [ ] Exact-origin CORS configured; remember CORS is not authentication.
- [ ] Anonymous sign-in enabled only if intended for pseudonymous pilot submissions; abuse controls and retention documented.
- [ ] Payload limit, response count, stable unique item IDs, response time bounds and consent are validated server-side.
- [ ] Session + consent + all responses save atomically; duplicate/partial submissions tested.
- [ ] Client-reported score/correctness clearly marked untrusted; no high-stakes use.
- [ ] No names, email addresses, phone numbers, raw IP addresses or exact birth dates stored in research tables.
- [ ] Public key is the only key in browser; rotate any leaked service-role key.
- [ ] Network failure never produces a false success message; local JSON export remains available.
- [ ] Retention/deletion and withdrawal procedures defined; rate-limit records cleaned according to policy.
- [ ] Auth, CORS, SQL grants, malformed payloads, rate limits and cross-user access tested before launch.
- [ ] Privacy notice and consent wording reviewed before recruiting real participants.
