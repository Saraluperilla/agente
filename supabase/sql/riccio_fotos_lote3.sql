-- Pegar en Supabase > SQL Editor > Run.
-- Fotos reales, lote 3: Aceites y tratamientos.
-- Solo cambia img_url de los 4 productos que todavía tenían el dibujo .svg.
-- No crea ni borra nada; se puede correr varias veces.

begin;

update public.productos_practica set img_url = 'img/shine-drops.jpg'  where nombre = 'Riccio Shine Drops';
update public.productos_practica set img_url = 'img/scalp-oil.jpg'    where nombre = 'Riccio Scalp Oil';
update public.productos_practica set img_url = 'img/curl-refresh.jpg' where nombre = 'Riccio Curl Refresh';
update public.productos_practica set img_url = 'img/night-repair.jpg' where nombre = 'Riccio Night Repair';

commit;

-- Comprobar: no debe salir ninguna fila (todos los productos ya tienen foto .jpg).
select id, nombre, img_url from public.productos_practica
where img_url not like '%.jpg';