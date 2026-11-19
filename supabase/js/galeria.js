// galeria.js: escaparate de productos RICCIO para el cliente (SIN Supabase todavía).
//
// Los productos tienen LAS MISMAS columnas que la tabla productos_practica
// (nombre, descripción, precio, unidades, descuento, disponible,
// caracteristicas, img_url). Así, cuando conectemos Supabase, solo cambia
// de dónde sale PRODUCTS:
//   const { data } = await db.from('productos_practica').select('*');
//
// Única columna nueva: "categoria" (la tabla todavía no la tiene; habrá
// que agregarla para poder armar las filas por categoría).

// Catálogo de RICCIO (marca propia ficticia de cuidado capilar).
// Las fotos están en la carpeta img/ (rutas relativas a galeria.html).
// Presentación y necesidades capilares van en "caracteristicas";
// beneficios y modo de uso, dentro de "descripción".

const PRODUCTS = [
  { id: 1, categoria: 'Champús', nombre: 'Riccio Hidra Clean', precio: 38900, unidades: 42, descuento: 0.10, disponible: true,
    caracteristicas: ['500 ml', 'Limpieza', 'Hidratación'], img_url: 'img/hidra-clean.jpg',
    'descripción': 'Champú hidratante sin sulfatos con aloe vera y glicerina vegetal. Limpia con suavidad y deja el rizo listo para recibir humedad. Beneficios: limpia sin resecar, conserva la hidratación natural del rizo, fórmula sin sulfatos ni siliconas. Modo de uso: Aplica sobre el cabello húmedo, masajea el cuero cabelludo con las yemas de los dedos y enjuaga. Repite si lo necesitas.' },
  { id: 2, categoria: 'Champús', nombre: 'Riccio Curl Balance', precio: 39900, unidades: 30, descuento: 0, disponible: true,
    caracteristicas: ['500 ml', 'Limpieza', 'Definición'], img_url: 'img/curl-balance.jpg',
    'descripción': 'Champú equilibrante para cabello mixto: raíz con tendencia grasa y puntas secas. Con extracto de pepino y proteína de arroz. Beneficios: equilibra la raíz sin resecar las puntas, deja el rizo suelto y ligero, aroma fresco y suave. Modo de uso: Concentra el champú en la raíz, masajea y deja que la espuma recorra las puntas al enjuagar.' },
  { id: 3, categoria: 'Champús', nombre: 'Riccio Scalp Fresh', precio: 41900, unidades: 18, descuento: 0, disponible: true,
    caracteristicas: ['500 ml', 'Limpieza'], img_url: 'img/scalp-fresh.jpg',
    'descripción': 'Champú purificante con menta y árbol de té. Retira los residuos de cremas y geles y deja una sensación de frescura. Beneficios: sensación de frescura inmediata, retira residuos de productos de peinado, cuero cabelludo limpio y cómodo. Modo de uso: Úsalo una vez por semana o cuando sientas acumulación. Masajea 1 minuto en el cuero cabelludo y enjuaga bien.' },
  { id: 4, categoria: 'Acondicionadores', nombre: 'Riccio Soft Curls', precio: 39900, unidades: 35, descuento: 0, disponible: true,
    caracteristicas: ['500 ml', 'Hidratación', 'Control del frizz'], img_url: 'img/soft-curls.jpg',
    'descripción': 'Acondicionador ligero con manteca de mango. Suaviza las ondas y los rizos sin apelmazarlos. Beneficios: suavidad desde el primer uso, ligero: no apelmaza las ondas, brillo natural. Modo de uso: Después del champú, aplica de medios a puntas, desenreda con los dedos, deja actuar 2 minutos y enjuaga con agua fría.' },
  { id: 5, categoria: 'Acondicionadores', nombre: 'Riccio Deep Moisture', precio: 44900, unidades: 25, descuento: 0, disponible: true,
    caracteristicas: ['500 ml', 'Hidratación', 'Nutrición'], img_url: 'img/deep-moisture.jpg',
    'descripción': 'Acondicionador de hidratación profunda con manteca de karité y aceite de coco, pensado para rizos secos y crespos. Beneficios: hidratación profunda y duradera, rizos más elásticos, ideal para cabello seco o poroso. Modo de uso: Aplica abundante producto de medios a puntas, peina con los dedos y deja actuar 3 a 5 minutos antes de enjuagar.' },
  { id: 6, categoria: 'Acondicionadores', nombre: 'Riccio Easy Detangle', precio: 42900, unidades: 6, descuento: 0, disponible: true,
    caracteristicas: ['500 ml', 'Hidratación', 'Control del frizz'], img_url: 'img/easy-detangle.jpg',
    'descripción': 'Acondicionador desenredante con mucílago de linaza. Hace que el peine se deslice y reduce la rotura al desenredar. Beneficios: desenreda en menos tiempo, menos quiebre al peinar, textura resbaladiza y ligera. Modo de uso: Con el cabello empapado, aplica por secciones y desenreda de puntas a raíz con peine de dientes anchos. Enjuaga.' },
  { id: 7, categoria: 'Cremas para peinar', nombre: 'Riccio Curl Define', precio: 46900, unidades: 50, descuento: 0, disponible: true,
    caracteristicas: ['300 ml', 'Definición', 'Hidratación'], img_url: 'img/curl-define.jpg',
    'descripción': 'Crema para peinar que define y da forma a rizos tipo 3, con aceite de jojoba y proteína de seda vegetal. Beneficios: rizos definidos y con movimiento, hidratación ligera durante el día, acabado suave, sin efecto acartonado. Modo de uso: Sobre el cabello húmedo, aplica por secciones con la técnica de "praying hands" y deja secar al aire o con difusor.' },
  { id: 8, categoria: 'Cremas para peinar', nombre: 'Riccio Soft Waves', precio: 43900, unidades: 28, descuento: 0, disponible: true,
    caracteristicas: ['300 ml', 'Definición', 'Control del frizz'], img_url: 'img/soft-waves.jpg',
    'descripción': 'Crema ligera para cabello ondulado (tipo 2). Marca la onda sin quitarle volumen. Beneficios: marca la onda sin apelmazar, controla el frizz suave, textura liviana. Modo de uso: Aplica una cantidad pequeña sobre el cabello húmedo y estruja de puntas a raíz ("scrunch"). Deja secar sin tocar.' },
  { id: 9, categoria: 'Cremas para peinar', nombre: 'Riccio Coily Cream', precio: 48900, unidades: 20, descuento: 0, disponible: true,
    caracteristicas: ['300 ml', 'Nutrición', 'Hidratación', 'Definición'], img_url: 'img/coily-cream.jpg',
    'descripción': 'Crema rica para cabello crespo (tipo 4) con manteca de karité y de cacao. Nutre y ayuda a formar los rizos más cerrados. Beneficios: nutrición intensa para crespos, ayuda a formar el patrón del rizo, suavidad que dura hasta el día siguiente. Modo de uso: Aplica por secciones pequeñas sobre el cabello húmedo y define con los dedos o con cepillo. Ideal para twist-outs.' },
  { id: 10, categoria: 'Cremas para peinar', nombre: 'Riccio Frizz Control', precio: 45900, unidades: 0, descuento: 0, disponible: false,
    caracteristicas: ['300 ml', 'Control del frizz', 'Definición'], img_url: 'img/frizz-control.jpg',
    'descripción': 'Crema antifrizz con aceite de argán. Ayuda a mantener el peinado en días húmedos. Beneficios: controla el frizz en días húmedos, brillo y suavidad, peinado que se mantiene por más tiempo. Modo de uso: Aplica sobre el cabello húmedo después del acondicionador. En seco, usa una cantidad mínima en las zonas con frizz.' },
  { id: 11, categoria: 'Geles y espumas', nombre: 'Riccio Strong Hold', precio: 36900, unidades: 33, descuento: 0, disponible: true,
    caracteristicas: ['250 ml', 'Definición', 'Control del frizz'], img_url: 'img/strong-hold.jpg',
    'descripción': 'Gel de fijación fuerte con linaza, sin alcohol. Crea una capa que protege la forma del rizo durante varios días. Beneficios: fijación fuerte y duradera, sin alcohol: no reseca, define rizos y crespos. Modo de uso: Aplica sobre la crema de peinar con el cabello húmedo. Deja secar por completo y luego rompe el "cast" con las manos.' },
  { id: 21, categoria: 'Geles y espumas', nombre: 'Riccio Strong Hold Tubo', precio: 34900, unidades: 24, descuento: 0, disponible: true,
    caracteristicas: ['250 ml', 'Definición'], img_url: 'img/strong-hold-tubo.jpg',
    'descripción': 'La misma fijación fuerte con linaza y sin alcohol, en tubo: se aprieta, no se derrama y cabe en cualquier bolso. Beneficios: definición duradera de tus rizos, fácil de dosificar, ideal para viajar. Modo de uso: Aplica sobre la crema de peinar con el cabello húmedo, por secciones. Deja secar por completo y rompe el "cast" con las manos.' },
  { id: 22, categoria: 'Geles y espumas', nombre: 'Riccio Strong Hold Sin Residuo', precio: 38900, unidades: 18, descuento: 0, disponible: true,
    caracteristicas: ['250 ml', 'Definición', 'Control del frizz'], img_url: 'img/strong-hold-sin-residuo.jpg',
    'descripción': 'Fijación fuerte con fórmula de secado limpio: no deja polvo blanco ni sensación pegajosa. Beneficios: definición duradera, sin residuo visible, se retira fácil al lavar. Modo de uso: Aplica sobre el cabello húmedo después de la crema de peinar. Deja secar al aire o con difusor y rompe el "cast" con las manos.' },
  { id: 12, categoria: 'Geles y espumas', nombre: 'Riccio Flexible Gel', precio: 34900, unidades: 40, descuento: 0.05, disponible: true,
    caracteristicas: ['250 ml', 'Definición', 'Hidratación'], img_url: 'img/flexible-gel.jpg',
    'descripción': 'Gel de fijación flexible con aloe vera. Define con movimiento natural, sin sensación rígida. Beneficios: fijación flexible y natural, hidrata mientras define, ideal para el día a día. Modo de uso: Distribuye sobre el cabello húmedo por secciones y estruja hacia arriba. Seca al aire o con difusor a baja temperatura.' },
  { id: 23, categoria: 'Geles y espumas', nombre: 'Riccio Flexible Gel Dosificador', precio: 36900, unidades: 27, descuento: 0, disponible: true,
    caracteristicas: ['250 ml', 'Definición', 'Control del frizz'], img_url: 'img/flexible-gel-dosificador.jpg',
    'descripción': 'Gel de fijación flexible en frasco con dosificador: sacas la cantidad justa sin meter los dedos. Beneficios: definición natural, movimiento y control, dosis exacta en cada uso, más higiénico. Modo de uso: Aplica 2 a 4 bombeos sobre el cabello húmedo por secciones y estruja hacia arriba. Seca al aire o con difusor.' },
  { id: 24, categoria: 'Geles y espumas', nombre: 'Riccio Flexible Gel Sin Rigidez', precio: 35900, unidades: 21, descuento: 0, disponible: true,
    caracteristicas: ['250 ml', 'Definición', 'Hidratación'], img_url: 'img/flexible-gel-sin-rigidez.jpg',
    'descripción': 'Gel ultraligero con aloe vera que define tus rizos sin dejarlos rígidos. Pensado para ondas y rizos finos. Beneficios: rizos suaves al tacto, sin efecto acartonado, no apelmaza. Modo de uso: Aplica una cantidad pequeña sobre el cabello húmedo y estruja de puntas a raíz. Deja secar sin tocar.' },
  { id: 13, categoria: 'Geles y espumas', nombre: 'Riccio Curl Mousse', precio: 37900, unidades: 14, descuento: 0, disponible: true,
    caracteristicas: ['200 ml', 'Definición', 'Control del frizz'], img_url: 'img/curl-mousse.jpg',
    'descripción': 'Espuma ligera para dar volumen y definición a ondas y rizos finos. Beneficios: volumen desde la raíz, definición ligera, no deja residuo pegajoso. Modo de uso: Agita el envase, aplica una porción del tamaño de una mandarina sobre el cabello húmedo y estruja de puntas a raíz.' },
  { id: 25, categoria: 'Geles y espumas', nombre: 'Riccio Curl Mousse Soft', precio: 36900, unidades: 16, descuento: 0, disponible: true,
    caracteristicas: ['200 ml', 'Definición'], img_url: 'img/curl-mousse-soft.jpg',
    'descripción': 'Espuma definidora de control suave para quienes quieren rizos con mucho movimiento. Beneficios: volumen ligero, definición natural, acabado suelto. Modo de uso: Agita el envase, aplica una porción del tamaño de una mandarina sobre el cabello húmedo y estruja de puntas a raíz.' },
  { id: 26, categoria: 'Geles y espumas', nombre: 'Riccio Curl Mousse Minimal', precio: 35900, unidades: 20, descuento: 0, disponible: true,
    caracteristicas: ['200 ml', 'Definición'], img_url: 'img/curl-mousse-minimal.jpg',
    'descripción': 'Edición minimalista de nuestra espuma para rizos: misma fórmula ligera en un envase de diseño limpio. Beneficios: volumen desde la raíz, definición ligera, no deja residuo pegajoso. Modo de uso: Agita el envase, aplica sobre el cabello húmedo y estruja de puntas a raíz. Seca al aire o con difusor.' },
  { id: 14, categoria: 'Mascarillas', nombre: 'Riccio Hydra Mask', precio: 52900, unidades: 22, descuento: 0.15, disponible: true,
    caracteristicas: ['350 ml', 'Hidratación'], img_url: 'img/hydra-mask.jpg',
    'descripción': 'Mascarilla hidratante con ácido hialurónico y aloe vera para rizos sedientos. Beneficios: hidratación intensa en 10 minutos, rizos más suaves y elásticos, recupera el brillo. Modo de uso: Una vez por semana, después del champú, aplica de medios a puntas, cubre con un gorro térmico 10 a 15 minutos y enjuaga.' },
  { id: 27, categoria: 'Mascarillas', nombre: 'Riccio Hydra Mask Intensa', precio: 54900, unidades: 18, descuento: 0, disponible: true,
    caracteristicas: ['350 ml', 'Hidratación', 'Nutrición'], img_url: 'img/hydra-mask-intensa.jpg',
    'descripción': 'Versión intensa de Hydra Mask, con doble concentración de aloe vera y glicerina vegetal para rizos muy secos. Beneficios: hidratación intensa, rizos más suaves, ideal después de sol o piscina. Modo de uso: Después del champú, aplica de medios a puntas, cubre con un gorro térmico 15 minutos y enjuaga.' },
  { id: 28, categoria: 'Mascarillas', nombre: 'Riccio Hydra Mask Aqua', precio: 56900, unidades: 14, descuento: 0, disponible: true,
    caracteristicas: ['350 ml', 'Hidratación'], img_url: 'img/hydra-mask-aqua.jpg',
    'descripción': 'Mascarilla de hidratación profunda con extracto de algas marinas y ácido hialurónico. Beneficios: hidratación profunda y duradera, sensación fresca, rizos con más rebote. Modo de uso: Una vez por semana, aplica sobre el cabello húmedo, deja actuar 10 a 15 minutos y enjuaga con agua fría.' },
  { id: 15, categoria: 'Mascarillas', nombre: 'Riccio Repair Mask', precio: 55900, unidades: 12, descuento: 0.20, disponible: true,
    caracteristicas: ['350 ml', 'Nutrición', 'Control del frizz'], img_url: 'img/repair-mask.jpg',
    'descripción': 'Mascarilla reparadora con proteínas vegetales de arroz y quinua para cabello maltratado por calor o tintes. Beneficios: fortalece la fibra capilar, reduce el quiebre, puntas con mejor aspecto. Modo de uso: Cada 15 días, aplica sobre el cabello limpio y húmedo, deja actuar 10 minutos y enjuaga. Alterna con Hydra Mask.' },
  { id: 29, categoria: 'Mascarillas', nombre: 'Riccio Repair Mask Cream', precio: 56900, unidades: 13, descuento: 0, disponible: true,
    caracteristicas: ['350 ml', 'Nutrición', 'Control del frizz'], img_url: 'img/repair-mask-cream.jpg',
    'descripción': 'Repair Mask en textura más cremosa, con manteca de karité añadida para cabello grueso o muy dañado. Beneficios: fortalece y reduce el quiebre, más suavidad, puntas con mejor aspecto. Modo de uso: Cada 15 días, aplica sobre el cabello limpio y húmedo, deja actuar 15 minutos y enjuaga.' },
  { id: 30, categoria: 'Mascarillas', nombre: 'Riccio Repair Mask Rose', precio: 57900, unidades: 10, descuento: 0, disponible: true,
    caracteristicas: ['350 ml', 'Nutrición', 'Hidratación'], img_url: 'img/repair-mask-rose.jpg',
    'descripción': 'Mascarilla reparadora con proteína de arroz y aceite de rosa mosqueta. Beneficios: repara y suaviza, brillo natural, aroma floral suave. Modo de uso: Aplica sobre el cabello húmedo de medios a puntas, deja actuar 10 minutos y enjuaga. Úsala cada 15 días.' },
  { id: 16, categoria: 'Mascarillas', nombre: 'Riccio Nutri Curls', precio: 54900, unidades: 17, descuento: 0, disponible: true,
    caracteristicas: ['350 ml', 'Nutrición', 'Hidratación'], img_url: 'img/nutri-curls.jpg',
    'descripción': 'Mascarilla nutritiva con aceite de aguacate y manteca de karité para rizos secos y opacos. Beneficios: nutrición profunda, suavidad y brillo, ideal para rizos secos o porosos. Modo de uso: Aplica sobre el cabello húmedo, desenreda con los dedos y deja actuar 15 minutos con calor suave. Enjuaga con agua fría.' },
  { id: 31, categoria: 'Mascarillas', nombre: 'Riccio Nutri Curls Leaf', precio: 55900, unidades: 15, descuento: 0, disponible: true,
    caracteristicas: ['350 ml', 'Nutrición', 'Hidratación'], img_url: 'img/nutri-curls-leaf.jpg',
    'descripción': 'Mascarilla nutritiva con extractos botánicos de aguacate y moringa. Beneficios: nutrición profunda, mayor brillo, fórmula de origen vegetal. Modo de uso: Aplica sobre el cabello húmedo, desenreda con los dedos y deja actuar 15 minutos. Enjuaga con agua fría.' },
  { id: 32, categoria: 'Mascarillas', nombre: 'Riccio Nutri Curls Gold', precio: 62900, unidades: 8, descuento: 0, disponible: true,
    caracteristicas: ['350 ml', 'Nutrición', 'Control del frizz'], img_url: 'img/nutri-curls-gold.jpg',
    'descripción': 'Edición premium de Nutri Curls con aceites de argán y macadamia. Beneficios: nutrición intensa, brillo de larga duración, suavidad que se nota al tacto. Modo de uso: Una vez por semana, aplica sobre el cabello húmedo, cubre con un gorro térmico 20 minutos y enjuaga.' },
  { id: 17, categoria: 'Aceites y tratamientos', nombre: 'Riccio Shine Drops', precio: 49900, unidades: 26, descuento: 0, disponible: true,
    caracteristicas: ['30 ml', 'Control del frizz', 'Nutrición'], img_url: 'img/shine-drops.jpg',
    'descripción': 'Gotas de brillo con aceites de argán y jojoba. Sella la hidratación y suaviza las puntas. Beneficios: brillo inmediato, sella la hidratación, puntas suaves. Modo de uso: Frota 2 o 3 gotas entre las palmas y aplica sobre el cabello seco o húmedo, sobre todo en las puntas.' },
  { id: 18, categoria: 'Aceites y tratamientos', nombre: 'Riccio Scalp Oil', precio: 47900, unidades: 19, descuento: 0, disponible: true,
    caracteristicas: ['30 ml', 'Nutrición'], img_url: 'img/scalp-oil.jpg',
    'descripción': 'Aceite para cuero cabelludo con romero y ricino. Pensado para masajes relajantes antes del lavado. Beneficios: nutre el cuero cabelludo, masaje relajante, aroma herbal suave. Modo de uso: Aplica unas gotas directamente en el cuero cabelludo, masajea 5 minutos y deja actuar 30 minutos antes del champú.' },
  { id: 19, categoria: 'Aceites y tratamientos', nombre: 'Riccio Curl Refresh', precio: 35900, unidades: 31, descuento: 0.10, disponible: true,
    caracteristicas: ['200 ml', 'Hidratación', 'Definición'], img_url: 'img/curl-refresh.jpg',
    'descripción': 'Spray refrescante para revivir los rizos entre lavados, con agua de rosas y glicerina vegetal. Beneficios: revive el rizo del segundo y tercer día, hidratación ligera en spray, aroma suave a rosas. Modo de uso: Rocía sobre el cabello seco, estruja con las manos y deja secar. También sirve para humedecer antes de redefinir.' },
  { id: 20, categoria: 'Aceites y tratamientos', nombre: 'Riccio Night Repair', precio: 58900, unidades: 9, descuento: 0, disponible: true,
    caracteristicas: ['50 ml', 'Nutrición', 'Control del frizz'], img_url: 'img/night-repair.jpg',
    'descripción': 'Sérum nocturno sin enjuague con aceite de camelia y ceramidas vegetales. Trabaja mientras duermes. Beneficios: suavidad al despertar, puntas con menos frizz, sin enjuague. Modo de uso: Antes de dormir, aplica una pequeña cantidad de medios a puntas y recoge el cabello en una piña con un gorro de satín.' }
];

// ===================== Utilidades =====================

const formatPrice = (value) => `$${Math.round(value).toLocaleString('es-CO')}`;
const finalPrice = (product) => product.precio * (1 - product.descuento);
const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

// "Tecnología" -> "tecnologia": sirve para ids de HTML y para buscar sin tildes.
// normalize('NFD') separa la letra de su tilde ("í" -> "i" + "´") y el
// replace borra esas tildes sueltas.
const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slug = (text) => normalize(text).replace(/\s+/g, '-');

// Categorías sin repetir, en el orden en que aparecen en los datos.
// new Set() elimina duplicados; [...set] lo vuelve a convertir en array.
const CATEGORIES = [...new Set(PRODUCTS.map((p) => p.categoria))];

// ===================== Cards y filas =====================

const shelvesEl = document.getElementById('shelves');
const chipsEl = document.getElementById('category-chips');
const emptySearchEl = document.getElementById('empty-search');
const searchInput = document.getElementById('search-input');

function createCard(product) {
  const percent = Math.round(product.descuento * 100);
  const soldOut = !product.disponible || product.unidades === 0;

  // Dos botones HERMANOS (no uno dentro del otro): uno abre el detalle y
  // otro agrega al carrito. Un botón dentro de otro botón no es HTML válido.
  return `
    <article class="product-card ${soldOut ? 'is-sold-out' : ''}">
      <button type="button" class="card-open" data-open="${product.id}" aria-label="Ver detalle de ${product.nombre}">
        <span class="card-media">
          <img src="${product.img_url}" alt="" loading="lazy">
          ${percent > 0 ? `<span class="badge">-${percent}%</span>` : ''}
          ${soldOut ? '<span class="badge badge-muted">Agotado</span>' : ''}
        </span>
        <span class="card-body">
          <span class="card-title">${product.nombre}</span>
          <span class="price">
            ${formatPrice(finalPrice(product))}
            ${percent > 0 ? `<s>${formatPrice(product.precio)}</s>` : ''}
          </span>
        </span>
      </button>
      <button type="button" class="card-add" data-add="${product.id}" ${soldOut ? 'disabled' : ''}>
        ${soldOut ? 'Sin stock' : '+ Agregar'}
      </button>
    </article>
  `;
}

function createShelf({ id, title, products }) {
  return `
    <section class="shelf" id="shelf-${id}" aria-labelledby="title-${id}">
      <div class="shelf-head">
        <h2 id="title-${id}">${title} <small>${products.length}</small></h2>
        <div class="shelf-controls">
          <button type="button" class="arrow" data-scroll="-1" aria-label="Anterior en ${title}">‹</button>
          <button type="button" class="arrow" data-scroll="1" aria-label="Siguiente en ${title}">›</button>
          <button type="button" class="link-button" data-expand aria-expanded="false">Ver todo</button>
        </div>
      </div>
      <div class="shelf-track">
        ${products.map(createCard).join('')}
      </div>
    </section>
  `;
}

// Arma las filas: primero "Ofertas" (todo lo que tiene descuento) y
// luego una por categoría. "query" filtra por nombre o característica.
function renderShelves(query = '') {
  const q = normalize(query.trim());
  const matches = (p) =>
    q === '' ||
    normalize(p.nombre).includes(q) ||
    p.caracteristicas.some((c) => normalize(c).includes(q));

  const visible = PRODUCTS.filter(matches);

  const shelves = [
    { id: 'ofertas', title: '🔥 Ofertas', products: visible.filter((p) => p.descuento > 0 && p.disponible) },
    ...CATEGORIES.map((cat) => ({
      id: slug(cat),
      title: cat,
      products: visible.filter((p) => p.categoria === cat),
    })),
  ].filter((shelf) => shelf.products.length > 0);   // filas vacías no se muestran

  shelvesEl.innerHTML = shelves.map(createShelf).join('');
  chipsEl.innerHTML = shelves
    .map((s) => `<a class="chip" href="#shelf-${s.id}">${s.title}</a>`)
    .join('');

  emptySearchEl.hidden = shelves.length > 0;
  emptySearchEl.textContent = `No encontramos productos con "${query.trim()}".`;

  // Las flechas empiezan bien: ‹ desactivada (estás al inicio).
  shelvesEl.querySelectorAll('.shelf-track').forEach(updateArrows);
}

// Desactiva ‹ al inicio de la fila y › al final.
function updateArrows(track) {
  const shelf = track.closest('.shelf');
  const max = track.scrollWidth - track.clientWidth;
  shelf.querySelector('[data-scroll="-1"]').disabled = track.scrollLeft <= 1;
  shelf.querySelector('[data-scroll="1"]').disabled = track.scrollLeft >= max - 1;
}

// Un solo listener para TODAS las filas (delegación de eventos): las
// filas se vuelven a crear al buscar, así que no conviene ponerle un
// listener a cada botón.
shelvesEl.addEventListener('click', (event) => {
  const arrow = event.target.closest('[data-scroll]');
  const expand = event.target.closest('[data-expand]');
  const open = event.target.closest('[data-open]');
  const add = event.target.closest('[data-add]');

  if (arrow) {
    const track = arrow.closest('.shelf').querySelector('.shelf-track');
    // Avanza casi una "pantalla" de la fila; scroll-snap lo acomoda en la card.
    track.scrollBy({ left: Number(arrow.dataset.scroll) * track.clientWidth * 0.9, behavior: 'smooth' });
  } else if (expand) {
    const shelf = expand.closest('.shelf');
    const expanded = shelf.classList.toggle('is-expanded');   // toggle devuelve true/false
    expand.textContent = expanded ? 'Ver menos' : 'Ver todo';
    expand.setAttribute('aria-expanded', expanded);
  } else if (add) {
    addToCart(Number(add.dataset.add), 1);
  } else if (open) {
    openProduct(Number(open.dataset.open));
  }
});

// "scroll" NO burbujea (no sube al padre como "click"). El "true" final
// activa la fase de CAPTURA: el evento pasa por shelvesEl de camino a la
// fila, y así un solo listener escucha el scroll de todas las filas.
shelvesEl.addEventListener('scroll', (event) => {
  if (event.target.classList?.contains('shelf-track')) updateArrows(event.target);
}, true);

window.addEventListener('resize', () => {
  shelvesEl.querySelectorAll('.shelf-track').forEach(updateArrows);
});

// Buscador en vivo, con "debounce" de 200 ms (igual que en admin.js).
let searchTimer = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => renderShelves(searchInput.value), 200);
});

// Si una imagen no carga, se marca para que el CSS muestre un fondo de relleno.
// "error" tampoco burbujea: por eso también va con captura (true).
document.addEventListener('error', (event) => {
  if (event.target.tagName === 'IMG') event.target.classList.add('is-broken');
}, true);

// ===================== Detalle (dialog) =====================

const dialog = document.getElementById('product-dialog');

function openProduct(id) {
  const product = findProduct(id);
  if (!product) return;

  const percent = Math.round(product.descuento * 100);
  const soldOut = !product.disponible || product.unidades === 0;
  const max = Math.max(product.unidades - quantityInCart(id), 0);   // no más de lo que hay

  dialog.innerHTML = `
    <div class="dialog-media">
      <img src="${product.img_url}" alt="${product.nombre}">
      ${percent > 0 ? `<span class="badge">-${percent}%</span>` : ''}
    </div>
    <div class="dialog-body">
      <button type="button" class="icon-button dialog-close" data-close aria-label="Cerrar">✕</button>
      <p class="pill">${product.categoria}</p>
      <h2 id="dialog-title">${product.nombre}</h2>
      <p class="price big">
        ${formatPrice(finalPrice(product))}
        ${percent > 0 ? `<s>${formatPrice(product.precio)}</s>` : ''}
      </p>
      <p class="description">${product['descripción']}</p>
      <ul class="tags">${product.caracteristicas.map((c) => `<li>${c}</li>`).join('')}</ul>
      <p class="stock ${soldOut ? 'out' : ''}">
        ${soldOut ? 'Agotado por ahora' : `${product.unidades} unidades disponibles`}
      </p>

      ${soldOut || max === 0 ? `
        <button type="button" class="primary" disabled>${soldOut ? 'Sin stock' : 'Ya tienes todas en el carrito'}</button>
      ` : `
        <div class="buy-row">
          <div class="stepper" data-max="${max}">
            <button type="button" data-step="-1" aria-label="Quitar uno">−</button>
            <output id="dialog-qty" aria-live="polite">1</output>
            <button type="button" data-step="1" aria-label="Agregar uno">+</button>
          </div>
          <button type="button" class="primary" data-dialog-add="${product.id}">Agregar al carrito</button>
        </div>
      `}
    </div>
  `;
  dialog.showModal();
}

dialog.addEventListener('click', (event) => {
  // Clic en el fondo oscuro: el target es el propio <dialog> (no su contenido).
  if (event.target === dialog || event.target.closest('[data-close]')) {
    dialog.close();
    return;
  }

  const step = event.target.closest('[data-step]');
  if (step) {
    const stepper = step.closest('.stepper');
    const output = stepper.querySelector('output');
    const next = Number(output.textContent) + Number(step.dataset.step);
    // Math.min/max lo dejan entre 1 y el máximo disponible.
    output.textContent = Math.min(Math.max(next, 1), Number(stepper.dataset.max));
    return;
  }

  const addBtn = event.target.closest('[data-dialog-add]');
  if (addBtn) {
    const qty = Number(dialog.querySelector('#dialog-qty').textContent);
    addToCart(Number(addBtn.dataset.dialogAdd), qty);
    dialog.close();
  }
});

// ===================== Carrito =====================
// Se guarda en localStorage como [{ id, cantidad }]: solo el id y la
// cantidad, no el producto entero. El precio se busca siempre en PRODUCTS,
// así nunca queda un precio viejo guardado.

const CART_KEY = 'galeriaCarrito';
let cart = loadCart();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    // Descarta productos que ya no existen en los datos.
    return saved.filter((item) => findProduct(item.id));
  } catch (e) {
    return [];
  }
}

function saveCart() {
  try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  renderCart();
}

const quantityInCart = (id) => cart.find((item) => item.id === id)?.cantidad || 0;

function addToCart(id, qty) {
  const product = findProduct(id);
  const current = quantityInCart(id);
  const allowed = Math.min(qty, product.unidades - current);

  if (allowed <= 0) {
    showToast(`Ya tienes todas las unidades de ${product.nombre}`);
    return;
  }

  if (current > 0) {
    cart = cart.map((item) => item.id === id ? { ...item, cantidad: item.cantidad + allowed } : item);
  } else {
    cart = [...cart, { id, cantidad: allowed }];
  }
  saveCart();
  showToast(`✓ ${product.nombre} agregado (${allowed})`);
  bumpCartButton();
}

function changeQuantity(id, delta) {
  const product = findProduct(id);
  cart = cart
    .map((item) => item.id === id
      ? { ...item, cantidad: Math.min(item.cantidad + delta, product.unidades) }
      : item)
    .filter((item) => item.cantidad > 0);   // si llega a 0, se quita
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
}

const cartList = document.getElementById('cart-list');
const cartCount = document.getElementById('cart-count');
const cartSummary = document.getElementById('cart-summary');

function renderCart() {
  // reduce() recorre el array acumulando un valor: aquí, la suma de cantidades.
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
  cartCount.textContent = totalItems;
  cartCount.hidden = totalItems === 0;

  if (cart.length === 0) {
    cartList.innerHTML = `
      <li class="cart-empty">
        <span aria-hidden="true">🛍️</span>
        <p>Tu carrito está vacío.</p>
        <button type="button" class="link-button" data-close-cart>Seguir comprando</button>
      </li>`;
    cartSummary.hidden = true;
    return;
  }

  cartList.innerHTML = cart.map(({ id, cantidad }) => {
    const p = findProduct(id);
    return `
      <li class="cart-item">
        <img src="${p.img_url}" alt="">
        <div class="cart-info">
          <strong>${p.nombre}</strong>
          <small>${formatPrice(finalPrice(p))} c/u</small>
          <div class="stepper small">
            <button type="button" data-cart-step="-1" data-id="${id}" aria-label="Quitar uno">−</button>
            <output>${cantidad}</output>
            <button type="button" data-cart-step="1" data-id="${id}" aria-label="Agregar uno"
              ${cantidad >= p.unidades ? 'disabled' : ''}>+</button>
          </div>
        </div>
        <div class="cart-side">
          <strong>${formatPrice(finalPrice(p) * cantidad)}</strong>
          <button type="button" class="link-button danger" data-remove="${id}">Quitar</button>
        </div>
      </li>`;
  }).join('');

  const subtotal = cart.reduce((sum, { id, cantidad }) => sum + findProduct(id).precio * cantidad, 0);
  const total = cart.reduce((sum, { id, cantidad }) => sum + finalPrice(findProduct(id)) * cantidad, 0);

  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('cart-savings').textContent = `−${formatPrice(subtotal - total)}`;
  document.getElementById('cart-savings-row').hidden = subtotal === total;
  document.getElementById('cart-total').textContent = formatPrice(total);
  cartSummary.hidden = false;
}

cartList.addEventListener('click', (event) => {
  const step = event.target.closest('[data-cart-step]');
  const remove = event.target.closest('[data-remove]');
  if (step) changeQuantity(Number(step.dataset.id), Number(step.dataset.cartStep));
  if (remove) removeFromCart(Number(remove.dataset.remove));
  if (event.target.closest('[data-close-cart]')) closeCart();
});

// ---------- Abrir / cerrar el panel del carrito ----------
const drawer = document.getElementById('cart-drawer');
const backdrop = document.getElementById('cart-backdrop');
const btnOpenCart = document.getElementById('btn-open-cart');

function openCart() {
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  document.body.classList.add('no-scroll');   // que la página de atrás no se mueva
  document.getElementById('btn-close-cart').focus();
}

function closeCart() {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;
  document.body.classList.remove('no-scroll');
  btnOpenCart.focus();   // el foco vuelve a donde estaba (accesibilidad)
}

btnOpenCart.addEventListener('click', openCart);
document.getElementById('btn-close-cart').addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && drawer.classList.contains('is-open')) closeCart();
});

// Pagar todavía no existe: es solo una aproximación visual.
document.getElementById('btn-checkout').addEventListener('click', () => {
  showToast('El pago llega cuando conectemos Supabase 😉');
});

// Pequeño "salto" del botón del carrito al agregar algo.
function bumpCartButton() {
  btnOpenCart.classList.remove('bump');
  void btnOpenCart.offsetWidth;   // reinicia la animación (mismo truco que en admin.js)
  btnOpenCart.classList.add('bump');
}

// ===================== Toast =====================
const toast = document.getElementById('toast');
let toastTimer = null;

function showToast(text) {
  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.hidden = false;
  toast.classList.remove('is-visible');
  void toast.offsetWidth;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2400);
}

// ===================== Inicio =====================
renderShelves();
renderCart();
