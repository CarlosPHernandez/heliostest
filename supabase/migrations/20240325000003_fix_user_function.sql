-- Update handle_new_user function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    profile_exists boolean;
begin
    -- Check if profile already exists
    select exists(
        select 1 from public.profiles where id = new.id
    ) into profile_exists;
    
    -- Only insert if profile doesn't exist
    if not profile_exists then
        insert into public.profiles (
            id,
            email,
            full_name,
            created_at,
            updated_at
        )
        values (
            new.id,
            new.email,
            coalesce(
                new.raw_user_meta_data->>'full_name',
                new.raw_user_meta_data->>'name',
                split_part(new.email, '@', 1)
            ),
            now(),
            now()
        );
    end if;
    return new;
end;
$$;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user(); 