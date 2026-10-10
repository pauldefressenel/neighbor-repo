-- The neighbours: one profile per account, the public view of them, and
-- the two storage buckets for their pictures.
--
-- A neighbour signs in with an e-mail code (Supabase Auth), so every profile
-- belongs to a user in auth.users and goes when that user is deleted. The
-- 128 neighbours from the old project are imported by
-- import/import-neighbours.mjs, which creates their users first.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null check (char_length(trim(first_name)) between 1 and 40),
  last_name text,
  -- The country, in English as the old project stored it ("France").
  location text,
  -- What they are doing in their portrait ("Reading a book").
  activity text,
  -- Paths inside the buckets below, not full addresses, so a change of
  -- project or domain doesn't break them.
  avatar_path text,
  photo_path text,
  -- Null until the neighbour has answered in the app: the old project never
  -- asked.
  newsletter boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One per neighbour. Private: the public face is the neighbours view.';

alter table public.profiles enable row level security;

-- A neighbour reads and changes only their own profile. Creating it happens
-- once, right after the first sign-in.
create policy "own profile: read" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "own profile: create" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "own profile: update" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- "Automatically expose new tables" is off for this project, so every role
-- gets exactly what it needs. service_role (the import, and later the
-- server) bypasses row level security but still needs the grant.
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

create function public.touch_updated_at() returns trigger
  language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- What everyone may see of a neighbour, signed in or not (the wall): no
-- e-mail, no last name, no photo, no newsletter choice. A view owned by
-- postgres reads past the table's row level security, which is the point:
-- it shows every neighbour, but only these columns.
create view public.neighbours as
  select id, first_name, avatar_path, location, activity, created_at
  from public.profiles
  where avatar_path is not null;

grant select on public.neighbours to anon, authenticated, service_role;

-- Avatars are public, like the wall. The photos they were drawn from are
-- private: each neighbour's under a folder named after their id.
insert into storage.buckets (id, name, public) values
  ('avatars', 'avatars', true),
  ('photos', 'photos', false);

create policy "own photo: read" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "own photo: upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
