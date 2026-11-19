-- ============================================================
-- productos_practica: SOLO un administrador puede crear, editar o eliminar.
-- Todos (con o sin sesión) pueden VER el catálogo.
--
-- Dos capas, como en clientes_practica y pedidos:
--   1) Permisos de tabla (GRANT): qué OPERACIONES puede intentar cada rol.
--   2) Políticas RLS: sobre qué FILAS se permite (aquí: solo si eres admin).
-- Hoy la capa 2 ya existe, pero anon tiene GRANT completo (incluido DELETE y
-- TRUNCATE). TRUNCATE ni siquiera pasa por RLS: se quita.
--
-- Se puede correr varias veces. Va dentro de begin/commit: o todo o nada.
-- ============================================================

begin;

-- 1) Permisos de tabla
revoke all on public.productos_practica from anon, authenticated;

grant select on public.productos_practica to anon, authenticated;   -- ver el catálogo
-- authenticated necesita insert/update/delete porque los admins entran con ese
-- rol; RLS decide QUIÉN de ellos (solo los que están en admins_practica).
grant insert, update, delete on public.productos_practica to authenticated;
-- anon (sin sesión) ya no puede ni intentar escribir.

-- 2) Políticas RLS (se recrean para dejarlas explícitas)
alter table public.productos_practica enable row level security;

drop policy if exists "ver_productos"     on public.productos_practica;
drop policy if exists "crea_productos"    on public.productos_practica;
drop policy if exists "edita_productos"   on public.productos_practica;
drop policy if exists "elimina_productos" on public.productos_practica;

create policy "ver_productos" on public.productos_practica
for select to anon, authenticated
using ( true );

create policy "crea_productos" on public.productos_practica
for insert to authenticated
with check ( exists (select 1 from public.admins_practica where id = (select auth.uid())) );

create policy "edita_productos" on public.productos_practica
for update to authenticated
using      ( exists (select 1 from public.admins_practica where id = (select auth.uid())) )
with check ( exists (select 1 from public.admins_practica where id = (select auth.uid())) );

create policy "elimina_productos" on public.productos_practica
for delete to authenticated
using ( exists (select 1 from public.admins_practica where id = (select auth.uid())) );

commit;

-- Comprobar
select policyname, cmd, roles from pg_policies
where tablename = 'productos_practica' order by cmd;

select grantee, privilege_type from information_schema.role_table_grants
where table_name = 'productos_practica' and grantee in ('anon', 'authenticated')
order by grantee, privilege_type;
