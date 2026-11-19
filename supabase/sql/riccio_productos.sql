-- Pegar en Supabase > SQL Editor > Run.
-- Cambia el CONTENIDO de productos_practica por el catálogo de RICCIO
-- (marca colombiana ficticia de cuidado capilar). No crea tablas ni cambia
-- políticas: cliente.html y admin.html siguen funcionando igual.
--
-- Cómo se guardan los datos en las columnas que ya existen:
--   caracteristicas -> presentación + necesidades capilares (salen como chips
--                      y el buscador de cliente.html las encuentra)
--   descripción     -> descripción + beneficios + modo de uso
--   img_url         -> foto en la carpeta img/ (ruta relativa a cliente.html)

begin;

-- 0) La columna categoria (es lo mismo que sql/add_categoria_productos.sql:
--    "if not exists" = si ya la corriste, no pasa nada).
alter table public.productos_practica
  add column if not exists categoria text;

-- 1) Quitar los productos viejos (teclado, audífonos...).
--    Si alguno ya está en un pedido, la FK no deja borrarlo (error 23503):
--    ese se queda, pero marcado como no disponible y sin unidades.
--    El bloque "begin ... exception" atrapa el error de UNA fila sin
--    cancelar todo el script.
do $$
declare
  fila record;
begin
  for fila in
    select id, nombre from public.productos_practica where nombre not like 'Riccio %'
  loop
    begin
      delete from public.productos_practica where id = fila.id;
    exception when foreign_key_violation then
      update public.productos_practica
         set disponible = false, unidades = 0
       where id = fila.id;
      raise notice 'No se pudo borrar "%" (está en un pedido): quedó como no disponible.', fila.nombre;
    end;
  end loop;
end $$;

-- 2) Los 20 productos de RICCIO.
--    Va dentro de un "do" con if: si ya estaban cargados (corriste el
--    script antes), no los duplica.
--    Los textos '[...]' de caracteristicas se convierten solos al tipo de
--    la columna (json o jsonb), porque van directo en el insert.
do $$
begin
  if exists (select 1 from public.productos_practica where nombre like 'Riccio %') then
    raise notice 'Los productos RICCIO ya estaban cargados: no se insertan de nuevo.';
    return;
  end if;

  insert into public.productos_practica
    (nombre, categoria, precio, unidades, descuento, disponible, caracteristicas, img_url, "descripción")
  values
  ('Riccio Hidra Clean', 'Champús', 38900, 42, 0.10, true, '["500 ml", "Limpieza", "Hidratación"]', 'img/hidra-clean.jpg',
   'Champú hidratante sin sulfatos con aloe vera y glicerina vegetal. Limpia con suavidad y deja el rizo listo para recibir humedad. Beneficios: limpia sin resecar, conserva la hidratación natural del rizo, fórmula sin sulfatos ni siliconas. Modo de uso: Aplica sobre el cabello húmedo, masajea el cuero cabelludo con las yemas de los dedos y enjuaga. Repite si lo necesitas.'),
  ('Riccio Curl Balance', 'Champús', 39900, 30, 0, true, '["500 ml", "Limpieza", "Definición"]', 'img/curl-balance.jpg',
   'Champú equilibrante para cabello mixto: raíz con tendencia grasa y puntas secas. Con extracto de pepino y proteína de arroz. Beneficios: equilibra la raíz sin resecar las puntas, deja el rizo suelto y ligero, aroma fresco y suave. Modo de uso: Concentra el champú en la raíz, masajea y deja que la espuma recorra las puntas al enjuagar.'),
  ('Riccio Scalp Fresh', 'Champús', 41900, 18, 0, true, '["500 ml", "Limpieza"]', 'img/scalp-fresh.jpg',
   'Champú purificante con menta y árbol de té. Retira los residuos de cremas y geles y deja una sensación de frescura. Beneficios: sensación de frescura inmediata, retira residuos de productos de peinado, cuero cabelludo limpio y cómodo. Modo de uso: Úsalo una vez por semana o cuando sientas acumulación. Masajea 1 minuto en el cuero cabelludo y enjuaga bien.'),
  ('Riccio Soft Curls', 'Acondicionadores', 39900, 35, 0, true, '["500 ml", "Hidratación", "Control del frizz"]', 'img/soft-curls.jpg',
   'Acondicionador ligero con manteca de mango. Suaviza las ondas y los rizos sin apelmazarlos. Beneficios: suavidad desde el primer uso, ligero: no apelmaza las ondas, brillo natural. Modo de uso: Después del champú, aplica de medios a puntas, desenreda con los dedos, deja actuar 2 minutos y enjuaga con agua fría.'),
  ('Riccio Deep Moisture', 'Acondicionadores', 44900, 25, 0, true, '["500 ml", "Hidratación", "Nutrición"]', 'img/deep-moisture.jpg',
   'Acondicionador de hidratación profunda con manteca de karité y aceite de coco, pensado para rizos secos y crespos. Beneficios: hidratación profunda y duradera, rizos más elásticos, ideal para cabello seco o poroso. Modo de uso: Aplica abundante producto de medios a puntas, peina con los dedos y deja actuar 3 a 5 minutos antes de enjuagar.'),
  ('Riccio Easy Detangle', 'Acondicionadores', 42900, 6, 0, true, '["500 ml", "Hidratación", "Control del frizz"]', 'img/easy-detangle.jpg',
   'Acondicionador desenredante con mucílago de linaza. Hace que el peine se deslice y reduce la rotura al desenredar. Beneficios: desenreda en menos tiempo, menos quiebre al peinar, textura resbaladiza y ligera. Modo de uso: Con el cabello empapado, aplica por secciones y desenreda de puntas a raíz con peine de dientes anchos. Enjuaga.'),
  ('Riccio Curl Define', 'Cremas para peinar', 46900, 50, 0, true, '["300 ml", "Definición", "Hidratación"]', 'img/curl-define.jpg',
   'Crema para peinar que define y da forma a rizos tipo 3, con aceite de jojoba y proteína de seda vegetal. Beneficios: rizos definidos y con movimiento, hidratación ligera durante el día, acabado suave, sin efecto acartonado. Modo de uso: Sobre el cabello húmedo, aplica por secciones con la técnica de "praying hands" y deja secar al aire o con difusor.'),
  ('Riccio Soft Waves', 'Cremas para peinar', 43900, 28, 0, true, '["300 ml", "Definición", "Control del frizz"]', 'img/soft-waves.jpg',
   'Crema ligera para cabello ondulado (tipo 2). Marca la onda sin quitarle volumen. Beneficios: marca la onda sin apelmazar, controla el frizz suave, textura liviana. Modo de uso: Aplica una cantidad pequeña sobre el cabello húmedo y estruja de puntas a raíz ("scrunch"). Deja secar sin tocar.'),
  ('Riccio Coily Cream', 'Cremas para peinar', 48900, 20, 0, true, '["300 ml", "Nutrición", "Hidratación", "Definición"]', 'img/coily-cream.jpg',
   'Crema rica para cabello crespo (tipo 4) con manteca de karité y de cacao. Nutre y ayuda a formar los rizos más cerrados. Beneficios: nutrición intensa para crespos, ayuda a formar el patrón del rizo, suavidad que dura hasta el día siguiente. Modo de uso: Aplica por secciones pequeñas sobre el cabello húmedo y define con los dedos o con cepillo. Ideal para twist-outs.'),
  ('Riccio Frizz Control', 'Cremas para peinar', 45900, 0, 0, false, '["300 ml", "Control del frizz", "Definición"]', 'img/frizz-control.jpg',
   'Crema antifrizz con aceite de argán. Ayuda a mantener el peinado en días húmedos. Beneficios: controla el frizz en días húmedos, brillo y suavidad, peinado que se mantiene por más tiempo. Modo de uso: Aplica sobre el cabello húmedo después del acondicionador. En seco, usa una cantidad mínima en las zonas con frizz.'),
  ('Riccio Strong Hold', 'Geles y espumas', 36900, 33, 0, true, '["300 g", "Definición", "Control del frizz"]', 'img/strong-hold.svg',
   'Gel de fijación fuerte con linaza, sin alcohol. Crea una capa que protege la forma del rizo durante varios días. Beneficios: fijación fuerte y duradera, sin alcohol: no reseca, define rizos y crespos. Modo de uso: Aplica sobre la crema de peinar con el cabello húmedo. Deja secar por completo y luego rompe el "cast" con las manos.'),
  ('Riccio Flexible Gel', 'Geles y espumas', 34900, 40, 0.05, true, '["300 g", "Definición", "Hidratación"]', 'img/flexible-gel.svg',
   'Gel de fijación flexible con aloe vera. Define con movimiento natural, sin sensación rígida. Beneficios: fijación flexible y natural, hidrata mientras define, ideal para el día a día. Modo de uso: Distribuye sobre el cabello húmedo por secciones y estruja hacia arriba. Seca al aire o con difusor a baja temperatura.'),
  ('Riccio Curl Mousse', 'Geles y espumas', 37900, 14, 0, true, '["200 ml", "Definición"]', 'img/curl-mousse.svg',
   'Espuma ligera para dar volumen y definición a ondas y rizos finos. Beneficios: volumen desde la raíz, definición ligera, no deja residuo pegajoso. Modo de uso: Agita el envase, aplica una porción del tamaño de una mandarina sobre el cabello húmedo y estruja de puntas a raíz.'),
  ('Riccio Hydra Mask', 'Mascarillas', 52900, 22, 0.15, true, '["300 g", "Hidratación"]', 'img/hydra-mask.svg',
   'Mascarilla hidratante con ácido hialurónico y aloe vera para rizos sedientos. Beneficios: hidratación intensa en 10 minutos, rizos más suaves y elásticos, recupera el brillo. Modo de uso: Una vez por semana, después del champú, aplica de medios a puntas, cubre con un gorro térmico 10 a 15 minutos y enjuaga.'),
  ('Riccio Repair Mask', 'Mascarillas', 55900, 12, 0.20, true, '["300 g", "Nutrición", "Control del frizz"]', 'img/repair-mask.svg',
   'Mascarilla reparadora con proteínas vegetales de arroz y quinua para cabello maltratado por calor o tintes. Beneficios: fortalece la fibra capilar, reduce el quiebre, puntas con mejor aspecto. Modo de uso: Cada 15 días, aplica sobre el cabello limpio y húmedo, deja actuar 10 minutos y enjuaga. Alterna con Hydra Mask.'),
  ('Riccio Nutri Curls', 'Mascarillas', 54900, 17, 0, true, '["300 g", "Nutrición", "Hidratación"]', 'img/nutri-curls.svg',
   'Mascarilla nutritiva con aceite de aguacate y manteca de karité para rizos secos y opacos. Beneficios: nutrición profunda, suavidad y brillo, ideal para rizos secos o porosos. Modo de uso: Aplica sobre el cabello húmedo, desenreda con los dedos y deja actuar 15 minutos con calor suave. Enjuaga con agua fría.'),
  ('Riccio Shine Drops', 'Aceites y tratamientos', 49900, 26, 0, true, '["30 ml", "Control del frizz", "Nutrición"]', 'img/shine-drops.svg',
   'Gotas de brillo con aceites de argán y jojoba. Sella la hidratación y suaviza las puntas. Beneficios: brillo inmediato, sella la hidratación, puntas suaves. Modo de uso: Frota 2 o 3 gotas entre las palmas y aplica sobre el cabello seco o húmedo, sobre todo en las puntas.'),
  ('Riccio Scalp Oil', 'Aceites y tratamientos', 47900, 19, 0, true, '["30 ml", "Nutrición"]', 'img/scalp-oil.svg',
   'Aceite para cuero cabelludo con romero y ricino. Pensado para masajes relajantes antes del lavado. Beneficios: nutre el cuero cabelludo, masaje relajante, aroma herbal suave. Modo de uso: Aplica unas gotas directamente en el cuero cabelludo, masajea 5 minutos y deja actuar 30 minutos antes del champú.'),
  ('Riccio Curl Refresh', 'Aceites y tratamientos', 35900, 31, 0.10, true, '["200 ml", "Hidratación", "Definición"]', 'img/curl-refresh.svg',
   'Spray refrescante para revivir los rizos entre lavados, con agua de rosas y glicerina vegetal. Beneficios: revive el rizo del segundo y tercer día, hidratación ligera en spray, aroma suave a rosas. Modo de uso: Rocía sobre el cabello seco, estruja con las manos y deja secar. También sirve para humedecer antes de redefinir.'),
  ('Riccio Night Repair', 'Aceites y tratamientos', 58900, 9, 0, true, '["50 ml", "Nutrición", "Control del frizz"]', 'img/night-repair.svg',
   'Sérum nocturno sin enjuague con aceite de camelia y ceramidas vegetales. Trabaja mientras duermes. Beneficios: suavidad al despertar, puntas con menos frizz, sin enjuague. Modo de uso: Antes de dormir, aplica una pequeña cantidad de medios a puntas y recoge el cabello en una piña con un gorro de satín.')
  ;
end $$;

commit;

-- Comprobar: deben salir 6 categorías (3 + 3 + 4 + 3 + 3 + 4 = 20 productos).
select categoria, count(*) from public.productos_practica
group by categoria order by categoria;
