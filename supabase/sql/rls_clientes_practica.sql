-- Pegar en Supabase > SQL Editor > Run.
-- Protege clientes_practica: cada cliente solo ve, crea y edita SU fila;
-- los admins pueden ver todas. Nadie la borra desde el navegador.

-- 1) Activar RLS: desde aquí, sin policy que lo permita, todo queda bloqueado.
alter table public.clientes_practica enable row level security;

-- 2) LEER: solo mi propio perfil.
create policy "ver_mi_perfil"
on public.clientes_practica
for select
to authenticated
using ( (select auth.uid()) = id );

-- 3) LEER (admin): los admins ven todos los clientes.
--    Se suma a la anterior con OR (las policies permissive se combinan así).
create policy "admin_ve_clientes"
on public.clientes_practica
for select
to authenticated
using ( exists (select 1 from public.admins_practica where id = (select auth.uid())) );

-- 4) CREAR: solo mi propio perfil, y siempre como 'cliente'
--    (así nadie se registra con rol 'admin').
create policy "crear_mi_perfil"
on public.clientes_practica
for insert
to authenticated
with check ( (select auth.uid()) = id and rol = 'cliente' );

-- 5) EDITAR: solo mi propio perfil.
--    using      -> qué filas puedo tocar
--    with check -> cómo debe quedar la fila después (sigue siendo mía)
create policy "editar_mi_perfil"
on public.clientes_practica
for update
to authenticated
using ( (select auth.uid()) = id )
with check ( (select auth.uid()) = id );

-- 6) RLS decide QUÉ FILAS; los permisos de columna deciden QUÉ COLUMNAS.
--    El cliente solo puede cambiar nombre, teléfono y dirección:
--    id, correo y rol quedan fuera de su alcance.
revoke update on public.clientes_practica from authenticated;
grant update (nombre, telefono, direccion) on public.clientes_practica to authenticated;

-- 7) anon (sin sesión) no necesita nada en esta tabla.
revoke all on public.clientes_practica from anon;

-- No hay policy de DELETE: borrar perfiles queda solo para el dashboard.
