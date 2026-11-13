-- Pegar en Supabase > SQL Editor > Run.
-- Índices para la estructura nueva: pedidos (cabecera) + detalles_pedidos
-- (productos de cada pedido) + historial_estados_pedido.

-- 0) Revisar antes: si sale alguna fila, ese cliente tiene más de un
--    carrito y el índice único NO se puede crear (error 23505).
select cliente_id, count(*)
from public.pedidos
where estado = 'carrito'
group by cliente_id
having count(*) > 1;

-- 1) Un cliente solo puede tener UN carrito abierto (índice único parcial):
--    único -> no se repite cliente_id; parcial -> solo cuenta las filas en 'carrito'.
create unique index if not exists pedidos_un_carrito_por_cliente
  on public.pedidos (cliente_id)
  where estado = 'carrito';

-- 2) Postgres NO crea índices solo en las columnas de una clave foránea.
--    (detalles_pedidos.pedido_id ya queda indexada por el unique (pedido_id, producto_id)).
create index if not exists pedidos_cliente_id_idx
  on public.pedidos (cliente_id);

create index if not exists detalles_pedidos_producto_id_idx
  on public.detalles_pedidos (producto_id);

create index if not exists historial_estados_pedido_pedido_id_idx
  on public.historial_estados_pedido (pedido_id);
