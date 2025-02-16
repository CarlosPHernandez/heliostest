-- Update admin status for your user
update public.profiles
set is_admin = true
where email = 'carlos@heliosnexus.com'
returning id, email, is_admin;

-- Verify admin users
select id, email, is_admin, created_at
from public.profiles
where is_admin = true; 