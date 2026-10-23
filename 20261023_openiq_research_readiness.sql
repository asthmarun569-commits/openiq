-- OpenIQ research-readiness foundation
-- Adds separate research tables. Does NOT modify openiq_question_banks.
-- Run in Supabase SQL Editor only after reviewing the schema and backup policy.
-- This migration intentionally does not expose anonymous/public response inserts.

create table if not exists public.openiq_research_studies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 200),
  protocol_version text not null check (length(trim(protocol_version)) between 1 and 100),
  consent_version text not null check (length(trim(consent_version)) between 1 and 100),
  status text not null default 'draft' check (status in ('draft','approved','closed')),
  retention_days integer not null default 365 check (retention_days between 1 and 3650),
  protocol_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.openiq_assessment_versions (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.openiq_research_studies(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete cascade,
  version_label text not null check (length(trim(version_label)) between 1 and 100),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  snapshot_sha256 text not null check (snapshot_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (study_id, version_label),
  unique (study_id, snapshot_sha256)
);

create table if not exists public.openiq_research_responses (
  id uuid primary key default gen_random_uuid(),
  study_id uuid not null references public.openiq_research_studies(id) on delete restrict,
  assessment_version_id uuid not null references public.openiq_assessment_versions(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete cascade,
  participant_code text not null check (length(trim(participant_code)) between 8 and 100),
  consent_version text not null check (length(trim(consent_version)) between 1 and 100),
  consented_at timestamptz not null,
  completed_at timestamptz,
  withdrawn_at timestamptz,
  response_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(response_payload) = 'object'),
  created_at timestamptz not null default now(),
  constraint response_payload_no_obvious_identity_fields check (
    not (response_payload ? 'name') and
    not (response_payload ? 'email') and
    not (response_payload ? 'phone') and
    not (response_payload ? 'address')
  )
);

create table if not exists public.openiq_research_response_items (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.openiq_research_responses(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null check (length(trim(item_id)) between 1 and 100),
  selected_option_index smallint check (selected_option_index between 0 and 3),
  correct_option_index smallint not null check (correct_option_index between 0 and 3),
  is_correct boolean not null,
  response_time_ms integer check (response_time_ms is null or response_time_ms >= 0),
  created_at timestamptz not null default now(),
  unique (response_id, item_id)
);

create table if not exists public.openiq_item_review_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null check (length(trim(item_id)) between 1 and 100),
  item_revision integer not null default 1 check (item_revision >= 1),
  review_status text not null check (review_status in ('draft','under_review','approved_for_pilot','rejected')),
  reviewer_label text not null check (length(trim(reviewer_label)) between 1 and 120),
  reviewed_on date not null,
  rationale text not null check (length(trim(rationale)) between 1 and 2000),
  item_snapshot jsonb not null check (jsonb_typeof(item_snapshot) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists openiq_studies_owner_idx on public.openiq_research_studies(owner_id);
create index if not exists openiq_versions_study_idx on public.openiq_assessment_versions(study_id, created_at desc);
create index if not exists openiq_responses_study_idx on public.openiq_research_responses(study_id, created_at desc);
create index if not exists openiq_responses_owner_idx on public.openiq_research_responses(owner_id);
create index if not exists openiq_response_items_response_idx on public.openiq_research_response_items(response_id);
create index if not exists openiq_review_events_item_idx on public.openiq_item_review_events(owner_id, item_id, created_at desc);

-- Ensure the study owner and version owner are the same.
create or replace function public.openiq_check_version_study_owner()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  if not exists (
    select 1 from public.openiq_research_studies s
    where s.id = new.study_id and s.owner_id = new.owner_id
  ) then
    raise exception 'Study owner mismatch';
  end if;
  return new;
end;
$$;

drop trigger if exists openiq_version_owner_guard on public.openiq_assessment_versions;
create trigger openiq_version_owner_guard
before insert on public.openiq_assessment_versions
for each row execute function public.openiq_check_version_study_owner();

create or replace function public.openiq_check_response_links()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  if not exists (
    select 1 from public.openiq_research_studies s
    where s.id = new.study_id and s.owner_id = new.owner_id
  ) then
    raise exception 'Study owner mismatch';
  end if;
  if not exists (
    select 1 from public.openiq_assessment_versions v
    where v.id = new.assessment_version_id
      and v.study_id = new.study_id
      and v.owner_id = new.owner_id
  ) then
    raise exception 'Assessment version does not belong to this study and owner';
  end if;
  return new;
end;
$$;

drop trigger if exists openiq_response_links_guard on public.openiq_research_responses;
create trigger openiq_response_links_guard
before insert or update on public.openiq_research_responses
for each row execute function public.openiq_check_response_links();

create or replace function public.openiq_check_response_item_owner()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  if not exists (
    select 1 from public.openiq_research_responses r
    where r.id = new.response_id and r.owner_id = new.owner_id
  ) then
    raise exception 'Response owner mismatch';
  end if;
  return new;
end;
$$;

drop trigger if exists openiq_response_item_owner_guard on public.openiq_research_response_items;
create trigger openiq_response_item_owner_guard
before insert or update on public.openiq_research_response_items
for each row execute function public.openiq_check_response_item_owner();

-- Frozen server-side assessment versions cannot be updated or deleted.
create or replace function public.openiq_reject_version_mutation()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  raise exception 'Assessment versions are immutable. Create a new version instead.';
end;
$$;

drop trigger if exists openiq_version_no_update on public.openiq_assessment_versions;
create trigger openiq_version_no_update
before update or delete on public.openiq_assessment_versions
for each row execute function public.openiq_reject_version_mutation();

-- RLS: researcher-owned records only. No anonymous participant access is granted.
alter table public.openiq_research_studies enable row level security;
alter table public.openiq_assessment_versions enable row level security;
alter table public.openiq_research_responses enable row level security;
alter table public.openiq_research_response_items enable row level security;
alter table public.openiq_item_review_events enable row level security;

-- Remove named policies first so the migration is repeatable.
drop policy if exists openiq_studies_owner_all on public.openiq_research_studies;
drop policy if exists openiq_versions_owner_select on public.openiq_assessment_versions;
drop policy if exists openiq_versions_owner_insert on public.openiq_assessment_versions;
drop policy if exists openiq_responses_owner_all on public.openiq_research_responses;
drop policy if exists openiq_response_items_owner_all on public.openiq_research_response_items;
drop policy if exists openiq_review_events_owner_all on public.openiq_item_review_events;

create policy openiq_studies_owner_all on public.openiq_research_studies
for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy openiq_versions_owner_select on public.openiq_assessment_versions
for select to authenticated
using (owner_id = (select auth.uid()));
create policy openiq_versions_owner_insert on public.openiq_assessment_versions
for insert to authenticated
with check (owner_id = (select auth.uid()));

create policy openiq_responses_owner_all on public.openiq_research_responses
for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy openiq_response_items_owner_all on public.openiq_research_response_items
for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

create policy openiq_review_events_owner_all on public.openiq_item_review_events
for all to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

-- Explicitly do not grant anon table access. Authenticated access remains governed by RLS.
revoke all on public.openiq_research_studies from anon;
revoke all on public.openiq_assessment_versions from anon;
revoke all on public.openiq_research_responses from anon;
revoke all on public.openiq_research_response_items from anon;
revoke all on public.openiq_item_review_events from anon;

grant select, insert, update, delete on public.openiq_research_studies to authenticated;
grant select, insert on public.openiq_assessment_versions to authenticated;
grant select, insert, update, delete on public.openiq_research_responses to authenticated;
grant select, insert, update, delete on public.openiq_research_response_items to authenticated;
grant select, insert, update, delete on public.openiq_item_review_events to authenticated;

comment on table public.openiq_research_studies is 'Research protocol metadata; owner-controlled. No participant-facing submission endpoint is included.';
comment on table public.openiq_assessment_versions is 'Immutable server-side assessment snapshots for traceable study forms.';
comment on table public.openiq_research_responses is 'Pseudonymous study responses; direct anonymous inserts are intentionally disabled.';
comment on table public.openiq_research_response_items is 'Item-level responses for analysis; no direct participant identity fields.';
comment on table public.openiq_item_review_events is 'Append-only-by-convention review history; use a controlled backend for enforced append-only audit semantics.';
