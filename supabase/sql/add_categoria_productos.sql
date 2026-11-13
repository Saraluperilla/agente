-- Pegar en Supabase > SQL Editor > Run.
-- Agrega la columna "categoria" a productos_practica para que cliente.html
-- arme una fila por categoría. Mientras no se corra, todo cae en "Otros".

alter table public.productos_practica
  add column if not exists categoria text;

-- Ejemplo: asignar categorías a productos que ya existen (ajusta ids/nombres).
update public.productos_practica set categoria = 'Tecnología'
where nombre ilike '%teclado%' or nombre ilike '%mouse%' or nombre ilike '%audífono%';

-- Los clientes (anon y con sesión) necesitan poder LEER los productos.
-- Si productos_practica ya tiene RLS con una política de lectura, esto no hace falta.
-- create policy "Todos leen productos" on public.productos_practica
--   for select to anon, authenticated using (true);
