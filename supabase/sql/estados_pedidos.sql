-- ============================================================
-- Estados de pedidos: transiciones permitidas + historial automático.
--   carrito -> confirmado -> enviado -> entregado   (y cancelado desde cualquiera
--   de los tres primeros). Los pedidos confirmados no se borran: se cancelan.
--   Solo el carrito se puede borrar (política "vaciar_carrito" en rls_pedidos.sql).
-- Se puede correr varias veces (create or replace + drop trigger if exists).
-- ============================================================

-- 1) Solo se permiten ciertas transiciones de estado.
create or replace function public.validar_transicion_estado()
returns trigger
language plpgsql
set search_path = public
as $fn$
begin
  if new.estado = old.estado then
    return new;
  end if;

  if (old.estado, new.estado) in (
       ('carrito',    'confirmado'), ('carrito',    'cancelado'),
       ('confirmado', 'enviado'),    ('confirmado', 'cancelado'),
       ('enviado',    'entregado'),  ('enviado',    'cancelado')) then
    return new;
  end if;

  raise exception 'Transición de estado no permitida: % -> %', old.estado, new.estado;
end;
$fn$;

drop trigger if exists pedidos_validar_transicion on public.pedidos;

create trigger pedidos_validar_transicion
before update of estado on public.pedidos
for each row execute function public.validar_transicion_estado();

-- 2) Cada creación o cambio de estado queda registrado.
--    security definer: escribe en el historial aunque authenticated no tenga
--    permiso de insert ahí (rls_pedidos.sql solo le da select).
create or replace function public.registrar_cambio_estado()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if tg_op = 'INSERT' then
    insert into public.historial_estados_pedido (pedido_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, null, new.estado, auth.uid());
  else
    insert into public.historial_estados_pedido (pedido_id, estado_anterior, estado_nuevo, cambiado_por)
    values (new.id, old.estado, new.estado, auth.uid());
  end if;
  return new;
end;
$fn$;

drop trigger if exists pedidos_historial_alta  on public.pedidos;
drop trigger if exists pedidos_historial_cambio on public.pedidos;

create trigger pedidos_historial_alta
after insert on public.pedidos
for each row execute function public.registrar_cambio_estado();

create trigger pedidos_historial_cambio
after update of estado on public.pedidos
for each row
when (old.estado is distinct from new.estado)
execute function public.registrar_cambio_estado();
