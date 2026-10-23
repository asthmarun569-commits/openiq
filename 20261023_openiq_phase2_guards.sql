-- OpenIQ Phase 2: append-only review history and tighter study lifecycle checks.
-- Apply after 20261023_openiq_research_readiness.sql in a development project first.

create or replace function public.openiq_reject_review_event_mutation()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  raise exception 'Review history is append-only. Add a new event instead of editing or deleting history.';
end;
$$;

drop trigger if exists openiq_review_events_no_update on public.openiq_item_review_events;
create trigger openiq_review_events_no_update
before update or delete on public.openiq_item_review_events
for each row execute function public.openiq_reject_review_event_mutation();

-- Study status may move from draft to approved to closed, but not backwards.
create or replace function public.openiq_guard_study_status_transition()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  if (old.status = 'closed' and new.status <> 'closed') or
     (old.status = 'approved' and new.status = 'draft') then
    raise exception 'Invalid study status transition. Closed studies cannot reopen; approved studies cannot revert to draft.';
  end if;
  return new;
end;
$$;

drop trigger if exists openiq_study_status_transition_guard on public.openiq_research_studies;
create trigger openiq_study_status_transition_guard
before update of status on public.openiq_research_studies
for each row execute function public.openiq_guard_study_status_transition();

comment on function public.openiq_reject_review_event_mutation() is 'Enforces append-only review history at the database layer.';
