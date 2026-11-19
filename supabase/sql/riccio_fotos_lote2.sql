-- Pegar en Supabase > SQL Editor > Run (después de riccio_productos.sql).
-- Fotos reales, lote 2: geles, espumas y mascarillas.
-- 1) A los 6 productos que ya existen les pone la foto nueva y la
--    presentación que dice la foto (250 ml, 200 ml, 350 ml).
-- 2) Agrega 12 productos nuevos: versiones de los mismos productos con otro
--    envase o fórmula (tubo, dosificador, edición Gold...), con su propio precio.
-- No crea tablas ni columnas. Se puede correr dos veces sin duplicar nada.

begin;

-- 1) Fotos nuevas de los productos que ya estaban
update public.productos_practica
   set img_url = 'img/strong-hold.jpg', caracteristicas = '["250 ml", "Definición", "Control del frizz"]'
 where nombre = 'Riccio Strong Hold';

update public.productos_practica
   set img_url = 'img/flexible-gel.jpg', caracteristicas = '["250 ml", "Definición", "Hidratación"]'
 where nombre = 'Riccio Flexible Gel';

update public.productos_practica
   set img_url = 'img/curl-mousse.jpg', caracteristicas = '["200 ml", "Definición", "Control del frizz"]'
 where nombre = 'Riccio Curl Mousse';

update public.productos_practica
   set img_url = 'img/hydra-mask.jpg', caracteristicas = '["350 ml", "Hidratación"]'
 where nombre = 'Riccio Hydra Mask';

update public.productos_practica
   set img_url = 'img/repair-mask.jpg', caracteristicas = '["350 ml", "Nutrición", "Control del frizz"]'
 where nombre = 'Riccio Repair Mask';

update public.productos_practica
   set img_url = 'img/nutri-curls.jpg', caracteristicas = '["350 ml", "Nutrición", "Hidratación"]'
 where nombre = 'Riccio Nutri Curls';

-- 2) Las 12 versiones nuevas. Igual que en riccio_productos.sql, el insert va
--    directo en un "do" para que '[...]' se convierta solo a json o jsonb.
do $$
begin
  if exists (select 1 from public.productos_practica where nombre = 'Riccio Strong Hold Tubo') then
    raise notice 'Las versiones nuevas ya estaban cargadas: no se insertan de nuevo.';
    return;
  end if;

  insert into public.productos_practica
    (nombre, categoria, precio, unidades, descuento, disponible, caracteristicas, img_url, "descripción")
  values
    ('Riccio Strong Hold Tubo', 'Geles y espumas', 34900, 24, 0, true, '["250 ml", "Definición"]', 'img/strong-hold-tubo.jpg',
     'La misma fijación fuerte con linaza y sin alcohol, en tubo: se aprieta, no se derrama y cabe en cualquier bolso. Beneficios: definición duradera de tus rizos, fácil de dosificar, ideal para viajar. Modo de uso: Aplica sobre la crema de peinar con el cabello húmedo, por secciones. Deja secar por completo y rompe el "cast" con las manos.'),
    ('Riccio Strong Hold Sin Residuo', 'Geles y espumas', 38900, 18, 0, true, '["250 ml", "Definición", "Control del frizz"]', 'img/strong-hold-sin-residuo.jpg',
     'Fijación fuerte con fórmula de secado limpio: no deja polvo blanco ni sensación pegajosa. Beneficios: definición duradera, sin residuo visible, se retira fácil al lavar. Modo de uso: Aplica sobre el cabello húmedo después de la crema de peinar. Deja secar al aire o con difusor y rompe el "cast" con las manos.'),
    ('Riccio Flexible Gel Dosificador', 'Geles y espumas', 36900, 27, 0, true, '["250 ml", "Definición", "Control del frizz"]', 'img/flexible-gel-dosificador.jpg',
     'Gel de fijación flexible en frasco con dosificador: sacas la cantidad justa sin meter los dedos. Beneficios: definición natural, movimiento y control, dosis exacta en cada uso, más higiénico. Modo de uso: Aplica 2 a 4 bombeos sobre el cabello húmedo por secciones y estruja hacia arriba. Seca al aire o con difusor.'),
    ('Riccio Flexible Gel Sin Rigidez', 'Geles y espumas', 35900, 21, 0, true, '["250 ml", "Definición", "Hidratación"]', 'img/flexible-gel-sin-rigidez.jpg',
     'Gel ultraligero con aloe vera que define tus rizos sin dejarlos rígidos. Pensado para ondas y rizos finos. Beneficios: rizos suaves al tacto, sin efecto acartonado, no apelmaza. Modo de uso: Aplica una cantidad pequeña sobre el cabello húmedo y estruja de puntas a raíz. Deja secar sin tocar.'),
    ('Riccio Curl Mousse Soft', 'Geles y espumas', 36900, 16, 0, true, '["200 ml", "Definición"]', 'img/curl-mousse-soft.jpg',
     'Espuma definidora de control suave para quienes quieren rizos con mucho movimiento. Beneficios: volumen ligero, definición natural, acabado suelto. Modo de uso: Agita el envase, aplica una porción del tamaño de una mandarina sobre el cabello húmedo y estruja de puntas a raíz.'),
    ('Riccio Curl Mousse Minimal', 'Geles y espumas', 35900, 20, 0, true, '["200 ml", "Definición"]', 'img/curl-mousse-minimal.jpg',
     'Edición minimalista de nuestra espuma para rizos: misma fórmula ligera en un envase de diseño limpio. Beneficios: volumen desde la raíz, definición ligera, no deja residuo pegajoso. Modo de uso: Agita el envase, aplica sobre el cabello húmedo y estruja de puntas a raíz. Seca al aire o con difusor.'),
    ('Riccio Hydra Mask Intensa', 'Mascarillas', 54900, 18, 0, true, '["350 ml", "Hidratación", "Nutrición"]', 'img/hydra-mask-intensa.jpg',
     'Versión intensa de Hydra Mask, con doble concentración de aloe vera y glicerina vegetal para rizos muy secos. Beneficios: hidratación intensa, rizos más suaves, ideal después de sol o piscina. Modo de uso: Después del champú, aplica de medios a puntas, cubre con un gorro térmico 15 minutos y enjuaga.'),
    ('Riccio Hydra Mask Aqua', 'Mascarillas', 56900, 14, 0, true, '["350 ml", "Hidratación"]', 'img/hydra-mask-aqua.jpg',
     'Mascarilla de hidratación profunda con extracto de algas marinas y ácido hialurónico. Beneficios: hidratación profunda y duradera, sensación fresca, rizos con más rebote. Modo de uso: Una vez por semana, aplica sobre el cabello húmedo, deja actuar 10 a 15 minutos y enjuaga con agua fría.'),
    ('Riccio Repair Mask Cream', 'Mascarillas', 56900, 13, 0, true, '["350 ml", "Nutrición", "Control del frizz"]', 'img/repair-mask-cream.jpg',
     'Repair Mask en textura más cremosa, con manteca de karité añadida para cabello grueso o muy dañado. Beneficios: fortalece y reduce el quiebre, más suavidad, puntas con mejor aspecto. Modo de uso: Cada 15 días, aplica sobre el cabello limpio y húmedo, deja actuar 15 minutos y enjuaga.'),
    ('Riccio Repair Mask Rose', 'Mascarillas', 57900, 10, 0, true, '["350 ml", "Nutrición", "Hidratación"]', 'img/repair-mask-rose.jpg',
     'Mascarilla reparadora con proteína de arroz y aceite de rosa mosqueta. Beneficios: repara y suaviza, brillo natural, aroma floral suave. Modo de uso: Aplica sobre el cabello húmedo de medios a puntas, deja actuar 10 minutos y enjuaga. Úsala cada 15 días.'),
    ('Riccio Nutri Curls Leaf', 'Mascarillas', 55900, 15, 0, true, '["350 ml", "Nutrición", "Hidratación"]', 'img/nutri-curls-leaf.jpg',
     'Mascarilla nutritiva con extractos botánicos de aguacate y moringa. Beneficios: nutrición profunda, mayor brillo, fórmula de origen vegetal. Modo de uso: Aplica sobre el cabello húmedo, desenreda con los dedos y deja actuar 15 minutos. Enjuaga con agua fría.'),
    ('Riccio Nutri Curls Gold', 'Mascarillas', 62900, 8, 0, true, '["350 ml", "Nutrición", "Control del frizz"]', 'img/nutri-curls-gold.jpg',
     'Edición premium de Nutri Curls con aceites de argán y macadamia. Beneficios: nutrición intensa, brillo de larga duración, suavidad que se nota al tacto. Modo de uso: Una vez por semana, aplica sobre el cabello húmedo, cubre con un gorro térmico 20 minutos y enjuaga.')
  ;
end $$;

commit;

-- Comprobar: Geles y espumas y Mascarillas deben tener 9 productos cada una.
select categoria, count(*) from public.productos_practica
group by categoria order by categoria;
