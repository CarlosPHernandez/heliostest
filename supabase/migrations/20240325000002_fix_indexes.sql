-- Add performance indexes
create index if not exists profiles_is_admin_idx on public.profiles(is_admin);
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists project_messages_author_id_idx on public.project_messages(author_id);
create index if not exists project_messages_proposal_id_idx on public.project_messages(proposal_id); 