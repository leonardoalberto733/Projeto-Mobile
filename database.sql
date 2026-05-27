notify pgrst, 'reload schema';

drop function if exists public.is_group_member(uuid) cascade;
drop table if exists public.expenses cascade;
drop table if exists public.group_members cascade;
drop table if exists public.groups cascade;
drop table if exists public.users cascade;

create table public.users (
    id uuid primary key references auth.users(id) on delete cascade,
    name text not null,
    email text not null unique,
    created_at timestamptz default now()
);

create table public.groups (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_by uuid not null references public.users(id) on delete cascade,
    created_at timestamptz default now()
);

create table public.group_members (
    id uuid primary key default gen_random_uuid(),
    group_id uuid not null references public.groups(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    joined_at timestamptz default now(),
    unique(group_id, user_id)
);

create table public.expenses (
    id uuid primary key default gen_random_uuid(),
    group_id uuid not null references public.groups(id) on delete cascade,
    paid_by uuid not null references public.users(id),
    amount numeric(10,2) not null check (amount > 0),
    description text not null,
    receipt_url text,
    created_at timestamptz default now()
);

alter table public.users enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.expenses enable row level security;

create policy "users_all" on public.users for all using (auth.role() = 'authenticated');
create policy "groups_all" on public.groups for all using (auth.role() = 'authenticated');
create policy "group_members_all" on public.group_members for all using (auth.role() = 'authenticated');
create policy "expenses_all" on public.expenses for all using (auth.role() = 'authenticated');

create or replace function public.auto_confirmar_email() returns trigger as $$
begin
    new.email_confirmed_at := now();
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trigger_auto_confirmar_email on auth.users;
create trigger trigger_auto_confirmar_email before insert on auth.users for each row execute function public.auto_confirmar_email();

create or replace function public.handle_new_user() returns trigger as $$
begin
    insert into public.users (id, name, email)
    values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email)
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

insert into public.users (id, email, name)
select id, email, split_part(email, '@', 1) from auth.users on conflict (id) do nothing;

notify pgrst, 'reload schema';