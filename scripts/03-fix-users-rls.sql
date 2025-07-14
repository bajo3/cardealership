-- ─────────────────────────────────────────────────────────────
-- Allow writes on `users` table for the anonymous API role
-- You may tighten this later (e.g. check auth.role = 'authenticated'
--   or add a column like created_by and restrict on it).
-- ─────────────────────────────────────────────────────────────

alter table users enable row level security;

-- 1. INSERTs
drop policy if exists "Users can insert users" on users;
create policy "Admin UI can insert users"
on users
for insert
with check (true);    -- adjust as needed (e.g. auth.role() = 'authenticated')

-- 2. UPDATEs
drop policy if exists "Users can update users" on users;
create policy "Admin UI can update users"
on users
for update
using (true)          -- adjust as needed
with check (true);
