-- ============================================================
-- precio_unitario en detalles_pedidos lo fija la BASE DE DATOS, no el navegador.
-- Se copia desde productos_practica (precio con descuento aplicado) al insertar.
-- Complementa rls_pedidos.sql, donde authenticated solo puede insertar
-- (pedido_id, producto_id, cantidad) y nunca precio_unitario.
-- Se puede correr varias veces (create or replace + drop trigger if exists).
-- ============================================================

create or replace function public.fijar_precio_unitario()
returns trigger
language plpgsql
set search_path = public
as $fn$
declare
  v_precio     bigint;
  v_disponible boolean;
begin
  -- descuento se guarda como fracción (0.15 = 15 %), igual que en admin.js
  select round(p.precio * (1 - coalesce(p.descuento, 0)))::bigint,
         p.disponible
    into v_precio, v_disponible
    from public.productos_practica p
   where p.id = new.producto_id;

  if v_precio is null then
    raise exception 'Producto % no encontrado', new.producto_id;
  end if;

  -- Productos retirados (riccio_productos.sql los deja en disponible = false)
  if v_disponible is false then
    raise exception 'El producto % no está disponible', new.producto_id;
  end if;

  new.precio_unitario := v_precio;
  return new;
end;
$fn$;

drop trigger if exists detalles_pedidos_fijar_precio on public.detalles_pedidos;

create trigger detalles_pedidos_fijar_precio
before insert on public.detalles_pedidos
for each row execute function public.fijar_precio_unitario();
