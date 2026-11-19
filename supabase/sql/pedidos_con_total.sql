-- ============================================================
-- pedidos_con_total: cada pedido con su total calculado en la BASE DE DATOS,
-- nunca confiado al navegador.
--   total     = suma de cantidad * precio_unitario (precio fijado por el trigger
--               de precio_unitario_detalles.sql y confirmado en confirmar_pedido()).
--   productos = cuántas unidades hay en el pedido (para el contador del carrito).
--
-- security_invoker = true: la vista respeta el RLS de QUIEN la consulta.
-- Sin esto, la vista corre con los permisos de su dueño (postgres), se salta
-- las políticas de pedidos y cada cliente vería los pedidos de todos.
-- Se puede correr varias veces (create or replace).
-- ============================================================

create or replace view public.pedidos_con_total
with (security_invoker = true)
as
select p.*,
       coalesce(sum(d.cantidad * d.precio_unitario), 0)::bigint as total,
       coalesce(sum(d.cantidad), 0)::int                        as productos
  from public.pedidos p
  left join public.detalles_pedidos d on d.pedido_id = p.id
 group by p.id;

-- Permisos (los que estaban comentados en rls_pedidos.sql): solo lectura y
-- solo para usuarios con sesión. Lo que cada uno ve lo deciden las políticas
-- "ver_pedidos" y "ver_detalles".
revoke all    on public.pedidos_con_total from anon, authenticated;
grant  select on public.pedidos_con_total to authenticated;
