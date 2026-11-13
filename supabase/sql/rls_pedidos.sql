-- Pegar en Supabase > SQL Editor > Run.
-- RLS + permisos por columna para: pedidos, detalles_pedidos, historial_estados_pedido.
-- Va dentro de begin/commit: si una línea falla, no queda nada a medias.

begin;

-- 0) Políticas viejas: si pedidos se creó RENOMBRANDO pedidos_practica, las
--    políticas viejas se vinieron con la tabla. La de UPDATE del cliente dejaría
--    confirmar el pedido sin pasar por confirmar_pedido(). "if exists" = si no
--    están, no pasa nada.
drop policy if exists "Actualizar mi pedido mientras está en el carrito" on public.pedidos;
drop policy if exists "Admin actualiza cualquier pedido"                 on public.pedidos;
drop policy if exists "Crear mis propios pedidos"                        on public.pedidos;
drop policy if exists "Eliminar mi pedido mientras está en el carrito"   on public.pedidos;
drop policy if exists "Ver mis pedidos, o todos si soy admin"            on public.pedidos;

-- Y las nuevas, para poder correr este archivo más de una vez sin error 42710.
drop policy if exists "ver_pedidos"            on public.pedidos;
drop policy if exists "crear_carrito"          on public.pedidos;
drop policy if exists "vaciar_carrito"         on public.pedidos;
drop policy if exists "admin_actualiza_estado" on public.pedidos;
drop policy if exists "ver_detalles"           on public.detalles_pedidos;
drop policy if exists "agregar_detalle"        on public.detalles_pedidos;
drop policy if exists "cambiar_cantidad"       on public.detalles_pedidos;
drop policy if exists "quitar_detalle"         on public.detalles_pedidos;
drop policy if exists "ver_historial_admin"    on public.historial_estados_pedido;

-- 1) RLS activado en las 3 tablas nuevas.
alter table public.pedidos                  enable row level security;
alter table public.detalles_pedidos         enable row level security;
alter table public.historial_estados_pedido enable row level security;

-- 2) Permisos POR COLUMNA. Supabase concede todo por defecto a anon y
--    authenticated: se quita y se concede solo lo necesario. Así el navegador
--    NO puede enviar precio_unitario, estado ni confirmado_en.
revoke all on public.pedidos, public.detalles_pedidos, public.historial_estados_pedido
  from anon, authenticated;

grant select, delete         on public.pedidos to authenticated;
grant insert (cliente_id)    on public.pedidos to authenticated;
grant update (estado)        on public.pedidos to authenticated;  -- solo lo usará el admin (ver políticas)

grant select, delete                            on public.detalles_pedidos to authenticated;
grant insert (pedido_id, producto_id, cantidad) on public.detalles_pedidos to authenticated;
grant update (cantidad)                         on public.detalles_pedidos to authenticated;

grant select on public.historial_estados_pedido to authenticated;

-- La vista pedidos_con_total TODAVÍA NO EXISTE: cuando la crees, hazlo con
-- security_invoker = true (si no, la vista se salta el RLS de pedidos y cada
-- cliente vería los pedidos de todos). Luego descomenta:
-- revoke all on public.pedidos_con_total from anon, authenticated;
-- grant select on public.pedidos_con_total to authenticated;

-- 3) Políticas de pedidos. El cliente no tiene ninguna política de UPDATE:
--    confirma con la función confirmar_pedido().
create policy "ver_pedidos" on public.pedidos
for select to authenticated
using (
  (select auth.uid()) = cliente_id
  or exists (select 1 from public.admins_practica where id = (select auth.uid()))
);

create policy "crear_carrito" on public.pedidos
for insert to authenticated
with check ( (select auth.uid()) = cliente_id );

create policy "vaciar_carrito" on public.pedidos
for delete to authenticated
using ( (select auth.uid()) = cliente_id and estado = 'carrito' );

create policy "admin_actualiza_estado" on public.pedidos
for update to authenticated
using      ( exists (select 1 from public.admins_practica where id = (select auth.uid())) )
with check ( exists (select 1 from public.admins_practica where id = (select auth.uid())) );

-- 4) Políticas de detalles_pedidos: dependen del pedido padre.
--    La subconsulta sobre pedidos también pasa por SUS políticas: solo "ve"
--    los pedidos propios (o todos, si es admin).
create policy "ver_detalles" on public.detalles_pedidos
for select to authenticated
using ( exists (select 1 from public.pedidos p where p.id = detalles_pedidos.pedido_id) );

create policy "agregar_detalle" on public.detalles_pedidos
for insert to authenticated
with check (
  exists (select 1 from public.pedidos p
          where p.id = detalles_pedidos.pedido_id
            and p.cliente_id = (select auth.uid())
            and p.estado = 'carrito')
);

create policy "cambiar_cantidad" on public.detalles_pedidos
for update to authenticated
using (
  exists (select 1 from public.pedidos p
          where p.id = detalles_pedidos.pedido_id
            and p.cliente_id = (select auth.uid())
            and p.estado = 'carrito')
)
with check (
  exists (select 1 from public.pedidos p
          where p.id = detalles_pedidos.pedido_id
            and p.cliente_id = (select auth.uid())
            and p.estado = 'carrito')
);

create policy "quitar_detalle" on public.detalles_pedidos
for delete to authenticated
using (
  exists (select 1 from public.pedidos p
          where p.id = detalles_pedidos.pedido_id
            and p.cliente_id = (select auth.uid())
            and p.estado = 'carrito')
);

-- 5) Política del historial: solo lo lee un administrador.
create policy "ver_historial_admin" on public.historial_estados_pedido
for select to authenticated
using ( exists (select 1 from public.admins_practica where id = (select auth.uid())) );

commit;

-- Comprobar: qué políticas quedaron en cada tabla
select tablename, policyname, cmd from pg_policies
where tablename in ('pedidos', 'detalles_pedidos', 'historial_estados_pedido')
order by tablename, cmd;
