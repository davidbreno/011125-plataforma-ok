-- Normalize appointments: set doctor_id where missing by matching doctor_name to users.full_name
-- Strips 'Dr. ' prefix and compares case-insensitively

update public.appointments a
set doctor_id = u.id
from public.users u
where a.doctor_id is null
  and a.doctor_name is not null
  and lower(regexp_replace(a.doctor_name, '^dr\.\s*', '')) = lower(regexp_replace(u.full_name, '^dr\.\s*', ''));

-- Optional: standardize doctor_name to users.full_name with 'Dr. ' prefix
-- Uncomment if you want to normalize
-- update public.appointments a
-- set doctor_name = 'Dr. ' || u.full_name
-- from public.users u
-- where a.doctor_name is not null
--   and lower(regexp_replace(a.doctor_name, '^dr\.\s*', '')) = lower(regexp_replace(u.full_name, '^dr\.\s*', ''));
