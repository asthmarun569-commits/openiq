-- OpenIQ hosted research database v1.0.0
-- Apply to a dedicated Supabase project.
-- IQ conversion remains disabled. Client-reported scores/correctness are untrusted.

create extension if not exists pgcrypto;

create table if not exists public.research_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_version text not null check (length(consent_version) between 1 and 80),
  research_purpose text not null default 'OpenIQ exploratory item calibration',
  consented_at timestamptz not null default now(),
  withdrawn_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint consent_withdrawal_after_consent
    check (withdrawn_at is null or withdrawn_at >= consented_at),
  unique (id, user_id)
);

create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_id uuid not null,
  app_release text not null check (app_release ~ '^[0-9]+\.[0-9]+\.[0-9]+([+-][A-Za-z0-9.-]+)?$'),
  form_id text not null check (length(form_id) between 1 and 100),
  mode text not null check (mode in ('pilot', 'calibration')),
  age_band text null check (
    age_band is null or age_band in ('18-24','25-34','35-44','45-54','55-64','65+','not-provided')
  ),
  device_class text null check (
    device_class is null or device_class in ('mobile','tablet','desktop','other','not-provided')
  ),
  started_at timestamptz null,
  completed_at timestamptz null,
  item_count integer not null check (item_count between 1 and 200),
  raw_correct_count integer null check (raw_correct_count is null or raw_correct_count between 0 and item_count),
  client_reported_total integer null check (client_reported_total is null or client_reported_total between 0 and 200),
  score_status text not null default 'experimental_raw_only'
    check (score_status = 'experimental_raw_only'),
  created_at timestamptz not null default now(),
  constraint session_completion_after_start
    check (completed_at is null or started_at is null or completed_at >= started_at),
  constraint session_consent_owner_fk
    foreign key (consent_id, user_id)
    references public.research_consents(id, user_id) on delete cascade,
  unique (id, user_id)
);

create table if not exists public.item_responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null check (length(item_id) between 1 and 200),
  domain_code text not null check (domain_code in ('VCI','WMI','PRI','PSI','OTHER')),
  template_id text null check (template_id is null or length(template_id) <= 100),
  item_order integer not null check (item_order between 0 and 199),
  selected_option_label text null check (selected_option_label is null or length(selected_option_label) <= 500),
  is_answered boolean not null,
  response_time_ms integer null check (response_time_ms is null or response_time_ms between 0 and 3600000),
  stimulus_duration_ms integer null check (stimulus_duration_ms is null or stimulus_duration_ms between 0 and 60000),
  client_reported_correct boolean null,
  created_at timestamptz not null default now(),
  constraint response_answer_consistency
    check ((is_answered and selected_option_label is not null) or (not is_answered and selected_option_label is null)),
  constraint response_session_owner_fk
    foreign key (session_id, user_id)
    references public.assessment_sessions(id, user_id) on delete cascade,
  unique (session_id, item_id),
  unique (session_id, item_order)
);

create index if not exists assessment_sessions_user_created_idx
  on public.assessment_sessions(user_id, created_at desc);
create index if not exists assessment_sessions_form_release_idx
  on public.assessment_sessions(form_id, app_release, created_at desc);
create index if not exists item_responses_item_idx
  on public.item_responses(item_id);
create index if not exists item_responses_session_idx
  on public.item_responses(session_id);

alter table public.research_consents enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.item_responses enable row level security;

-- Remove broad policies if this migration is reapplied in a development project.
drop policy if exists "consent_owner_insert" on public.research_consents;
drop policy if exists "session_owner_insert" on public.assessment_sessions;
drop policy if exists "response_owner_insert" on public.item_responses;
drop policy if exists "consent_owner_select" on public.research_consents;
drop policy if exists "session_owner_select" on public.assessment_sessions;
drop policy if exists "response_owner_select" on public.item_responses;
drop policy if exists "consent_owner_withdraw" on public.research_consents;

create policy "consent_owner_insert"
on public.research_consents for insert to authenticated
with check (auth.uid() = user_id);

-- Owner-only SELECT policies are needed for the parent-existence checks below.
-- They expose only the authenticated participant's own consent/session rows.
create policy "consent_owner_select"
on public.research_consents for select to authenticated
using (auth.uid() = user_id);

create policy "session_owner_select"
on public.assessment_sessions for select to authenticated
using (auth.uid() = user_id);

create policy "session_owner_insert"
on public.assessment_sessions for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.research_consents c
    where c.id = consent_id
      and c.user_id = auth.uid()
      and c.withdrawn_at is null
  )
);

create policy "response_owner_insert"
on public.item_responses for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.assessment_sessions s
    where s.id = session_id
      and s.user_id = auth.uid()
  )
);

-- No browser policy permits reading other participants' data. Participants can
-- read only their own consent/session metadata; item responses remain non-readable
-- through browser roles. Research administrators should use a trusted restricted
-- admin environment for analysis/export.
-- Never place a service-role key in client-side code.

comment on table public.research_consents is
  'Pseudonymous consent records for the OpenIQ exploratory research pilot.';
comment on table public.assessment_sessions is
  'Assessment session metadata. raw_correct_count is client-reported and untrusted; never interpret as IQ.';
comment on table public.item_responses is
  'Item-level responses. client_reported_correct is untrusted because client code contains the item bank.';
