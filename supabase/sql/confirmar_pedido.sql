-- ============================================================
-- confirmar_pedido(): UNA operación atómica. Valida, descuenta stock, fija
-- precios y cambia el estado. O todo ocurre, o no ocurre nada (si algo falla,
-- Postgres deshace lo que ya había hecho).
--
-- Encaja con:
--   rls_pedidos.sql          -> el cliente no tiene UPDATE sobre pedidos: confirma por aquí.
--   precio_unitario_detalles.sql -> el precio del carrito era provisional; aquí queda el definitivo.
--   estados_pedidos.sql      -> el paso carrito -> confirmado pasa por su validación
--                               y queda en historial_estados_pedido.
-- Dirección y teléfono: si no llegan como parámetro, se toman del perfil del
-- cliente en clientes_practica (lo que guarda el panel "Mi cuenta" de cliente.html).
-- Se puede correr varias veces (create or replace).
-- ============================================================

create or replace function public.confirmar_pedido(
  p_pedido_id   bigint,
  p_envio       boolean,
  p_direccion   text default null,
  p_telefono    text default null,
  p_observacion text default null
)
returns public.pedidos
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_pedido    public.pedidos;
  v_direccion text;
  v_telefono  text;
  d           record;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión';
  end if;

  -- Bloquea la fila del pedido: dos confirmaciones simultáneas no pueden pisarse.
  select * into v_pedido
    from public.pedidos
   where id = p_pedido_id and cliente_id = auth.uid() and estado = 'carrito'
     for update;

  if not found then
    raise exception 'Pedido no encontrado o ya confirmado';
  end if;

  if not exists (select 1 from public.detalles_pedidos where pedido_id = p_pedido_id) then
    raise exception 'El carrito está vacío';
  end if;

  -- Lo que mande el navegador manda; si viene vacío, se usa el perfil guardado.
  select coalesce(nullif(trim(p_direccion), ''), nullif(trim(c.direccion), '')),
         coalesce(nullif(trim(p_telefono),  ''), nullif(trim(c.telefono),  ''))
    into v_direccion, v_telefono
    from public.clientes_practica c
   where c.id = auth.uid();

  if p_envio and (v_direccion is null or v_telefono is null) then
    raise exception 'Para envío a domicilio se requieren dirección y teléfono';
  end if;

  -- Descuenta el stock producto por producto, siempre en el mismo orden (evita bloqueos cruzados).
  -- El "where unidades >= cantidad" impide que dos clientes compren la última unidad a la vez.
  for d in
    select producto_id, cantidad
      from public.detalles_pedidos
     where pedido_id = p_pedido_id
     order by producto_id
  loop
    update public.productos_practica
       set unidades = unidades - d.cantidad
     where id = d.producto_id and disponible and unidades >= d.cantidad;

    if not found then
      raise exception 'Stock insuficiente para el producto %', d.producto_id;
    end if;
  end loop;

  -- Precio definitivo: el de este momento (mientras estaba en el carrito era provisional).
  -- descuento es fracción (0.15 = 15 %), igual que en admin.js.
  update public.detalles_pedidos dp
     set precio_unitario = round(p.precio * (1 - coalesce(p.descuento, 0)))::bigint
    from public.productos_practica p
   where p.id = dp.producto_id and dp.pedido_id = p_pedido_id;

  update public.pedidos
     set estado        = 'confirmado',
         envio         = p_envio,
         direccion     = case when p_envio then v_direccion end,
         telefono      = v_telefono,
         observacion   = nullif(trim(p_observacion), ''),
         confirmado_en = now()
   where id = p_pedido_id
  returning * into v_pedido;

  return v_pedido;
end;
$fn$;

-- Por defecto cualquiera (incluso anon) podría llamarla: se limita a usuarios con sesión.
revoke all     on function public.confirmar_pedido(bigint, boolean, text, text, text) from public, anon;
grant  execute on function public.confirmar_pedido(bigint, boolean, text, text, text) to authenticated;
