-- OpenIQ atomic research submission hardening.
-- Additive migration for the schema in 202610200001_openiq_research_v1.sql.
-- Apply only after the base research schema exists in STAGING.

create table if not exists public.openiq_submission_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now()
);
alter table public.openiq_submission_limits enable row level security;
revoke all on public.openiq_submission_limits from anon, authenticated;
grant select, insert, update, delete on public.openiq_submission_limits to service_role;

-- Remove direct browser writes to research tables. Research submissions must pass through
-- the authenticated Edge Function and this transaction, not separate client inserts.
drop policy if exists "consent_owner_insert" on public.research_consents;
drop policy if exists "session_owner_insert" on public.assessment_sessions;
drop policy if exists "response_owner_insert" on public.item_responses;
revoke insert, update, delete on public.research_consents from anon, authenticated;
revoke insert, update, delete on public.assessment_sessions from anon, authenticated;
revoke insert, update, delete on public.item_responses from anon, authenticated;
grant insert, select, update, delete on public.research_consents to service_role;
grant insert, select, update, delete on public.assessment_sessions to service_role;
grant insert, select, update, delete on public.item_responses to service_role;

create or replace function public.openiq_submit_research_session(
  p_user_id uuid,
  p_consent_id uuid,
  p_consent_version text,
  p_session jsonb,
  p_responses jsonb
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_window timestamptz;
  v_count integer;
  v_total integer;
  v_correct integer;
  v_session_id uuid;
  v_row jsonb;
  v_item_count integer;
  v_seen integer := 0;
  v_domain text;
  v_selected text;
begin
  if p_user_id is null or p_consent_id is null then
    raise exception using errcode = '22023', message = 'invalid_owner_or_consent';
  end if;
  if p_consent_version is null or length(p_consent_version) not between 1 and 80 then
    raise exception using errcode = '22023', message = 'invalid_consent_version';
  end if;
  if jsonb_typeof(p_session) <> 'object' or jsonb_typeof(p_responses) <> 'array' then
    raise exception using errcode = '22023', message = 'invalid_payload';
  end if;
  v_item_count := jsonb_array_length(p_responses);
  v_total := (p_session->>'item_count')::integer;
  v_correct := nullif(p_session->>'raw_correct_count','')::integer;
  if v_item_count < 1 or v_item_count > 200 or v_total <> v_item_count then
    raise exception using errcode = '22023', message = 'item_count_mismatch';
  end if;
  if v_correct is not null and (v_correct < 0 or v_correct > v_total) then
    raise exception using errcode = '22023', message = 'invalid_raw_score';
  end if;
  if (p_session->>'mode') not in ('pilot','calibration') then
    raise exception using errcode = '22023', message = 'invalid_mode';
  end if;
  if length(coalesce(p_session->>'app_release','')) > 80 or length(coalesce(p_session->>'form_id','')) not between 1 and 100 then
    raise exception using errcode = '22023', message = 'invalid_release_or_form';
  end if;

  -- Atomic per-user rate limit: 10 submissions per 15 minutes.
  insert into public.openiq_submission_limits(user_id, window_started_at, request_count, updated_at)
  values (p_user_id, v_now, 1, v_now)
  on conflict (user_id) do update set
    window_started_at = case when public.openiq_submission_limits.window_started_at < v_now - interval '15 minutes' then v_now else public.openiq_submission_limits.window_started_at end,
    request_count = case when public.openiq_submission_limits.window_started_at < v_now - interval '15 minutes' then 1 else public.openiq_submission_limits.request_count + 1 end,
    updated_at = v_now;
  select window_started_at, request_count into v_window, v_count
    from public.openiq_submission_limits where user_id = p_user_id for update;
  if v_count > 10 and v_window >= v_now - interval '15 minutes' then
    raise exception using errcode = 'P0001', message = 'rate_limit_exceeded';
  end if;

  v_session_id := coalesce(nullif(p_session->>'id','')::uuid, gen_random_uuid());
  insert into public.research_consents(id, user_id, consent_version, research_purpose)
  values (p_consent_id, p_user_id, p_consent_version, 'OpenIQ exploratory item calibration');

  insert into public.assessment_sessions(
    id, user_id, consent_id, app_release, form_id, mode, age_band, device_class,
    started_at, completed_at, item_count, raw_correct_count, client_reported_total
  ) values (
    v_session_id, p_user_id, p_consent_id,
    p_session->>'app_release', p_session->>'form_id', p_session->>'mode',
    case when p_session->>'age_band' in ('18-24','25-34','35-44','45-54','55-64','65+') then p_session->>'age_band' else null end,
    case when p_session->>'device_class' in ('mobile','tablet','desktop','other') then p_session->>'device_class' else null end,
    nullif(p_session->>'started_at','')::timestamptz,
    nullif(p_session->>'completed_at','')::timestamptz,
    v_total, v_correct, v_total
  );

  for v_row in select value from jsonb_array_elements(p_responses) loop
    if length(coalesce(v_row->>'item_id','')) not between 1 and 200 then
      raise exception using errcode = '22023', message = 'invalid_item_id';
    end if;
    v_domain := case when v_row->>'domain_code' in ('VCI','WMI','PRI','PSI') then v_row->>'domain_code' else 'OTHER' end;
    v_selected := nullif(left(coalesce(v_row->>'selected_option_label',''),500),'');
    insert into public.item_responses(
      session_id, user_id, item_id, domain_code, template_id, item_order,
      selected_option_label, is_answered, response_time_ms, stimulus_duration_ms, client_reported_correct
    ) values (
      v_session_id, p_user_id, v_row->>'item_id', v_domain,
      nullif(left(coalesce(v_row->>'template_id',''),100),''),
      (v_row->>'item_order')::integer,
      v_selected,
      (v_row->>'is_answered')::boolean,
      case when v_row->'response_time_ms' is null or v_row->'response_time_ms' = 'null'::jsonb then null else (v_row->>'response_time_ms')::integer end,
      case when v_row->'stimulus_duration_ms' is null or v_row->'stimulus_duration_ms' = 'null'::jsonb then null else (v_row->>'stimulus_duration_ms')::integer end,
      case when v_row->'client_reported_correct' is null or v_row->'client_reported_correct' = 'null'::jsonb then null else (v_row->>'client_reported_correct')::boolean end
    );
    v_seen := v_seen + 1;
  end loop;
  if v_seen <> v_total then
    raise exception using errcode = '22023', message = 'response_count_mismatch';
  end if;
  return jsonb_build_object('ok', true, 'session_id', v_session_id, 'response_count', v_seen);
end;
$$;

revoke all on function public.openiq_submit_research_session(uuid, uuid, text, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.openiq_submit_research_session(uuid, uuid, text, jsonb, jsonb) to service_role;

comment on function public.openiq_submit_research_session(uuid, uuid, text, jsonb, jsonb) is
  'Atomic authenticated OpenIQ research submission. Raw score and correctness remain client-reported/untrusted.';
