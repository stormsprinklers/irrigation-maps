-- Add controller model selection for manual links on customer share page
alter table public.controllers
  add column if not exists controller_model_id text;
