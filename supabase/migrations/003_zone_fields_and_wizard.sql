-- Update zone enums, add slope, reduce wizard to 5 steps

alter table public.zones drop constraint if exists zones_vegetation_type_check;
alter table public.zones add constraint zones_vegetation_type_check
  check (vegetation_type in ('grass', 'shrubs', 'trees', 'flower_bed'));

alter table public.zones drop constraint if exists zones_shade_level_check;
alter table public.zones add constraint zones_shade_level_check
  check (shade_level in ('full_sun', 'some_shade', 'lots_of_shade'));

alter table public.zones drop constraint if exists zones_soil_type_check;
alter table public.zones add constraint zones_soil_type_check
  check (soil_type in ('sand', 'clay', 'loam'));

alter table public.zones drop constraint if exists zones_irrigation_type_check;
alter table public.zones add constraint zones_irrigation_type_check
  check (irrigation_type in ('spray', 'rotary', 'rotor', 'drip', 'bubbler'));

alter table public.zones add column if not exists slope_level text
  check (slope_level in ('flat', 'moderate', 'steep'));

-- Migrate legacy values
update public.zones set vegetation_type = 'grass' where vegetation_type = 'turf';
update public.zones set vegetation_type = 'flower_bed' where vegetation_type in ('groundcover', 'mixed');
update public.zones set shade_level = 'some_shade' where shade_level = 'partial_shade';
update public.zones set shade_level = 'lots_of_shade' where shade_level = 'full_shade';
update public.zones set irrigation_type = 'rotary' where irrigation_type = 'rotary_nozzle';
update public.zones set slope_level = 'flat' where slope_level is null;

alter table public.properties drop constraint if exists properties_wizard_step_check;
alter table public.properties add constraint properties_wizard_step_check
  check (wizard_step between 1 and 5);

update public.properties set wizard_step = case
  when wizard_step <= 2 then wizard_step
  when wizard_step = 3 then 2
  when wizard_step = 4 then 3
  when wizard_step = 5 then 4
  when wizard_step >= 6 then 5
  else wizard_step
end;
