// galeria.js: escaparate de productos para el cliente (SIN Supabase todavía).
//
// Los productos tienen LAS MISMAS columnas que la tabla productos_practica
// (nombre, descripción, precio, unidades, descuento, disponible,
// caracteristicas, img_url). Así, cuando conectemos Supabase, solo cambia
// de dónde sale PRODUCTS:
//   const { data } = await db.from('productos_practica').select('*');
//
// Única columna nueva: "categoria" (la tabla todavía no la tiene; habrá
// que agregarla para poder armar las filas por categoría).

// Imágenes de relleno: picsum.photos devuelve una foto al azar pero fija
// para cada "seed" (no corresponde al producto, es solo para el diseño).
const img = (seed) => `https://picsum.photos/seed/${seed}/480/600`;

const PRODUCTS = [
  { id: 1,  categoria: 'Tecnología', nombre: 'Audífonos Bluetooth X200', 'descripción': 'Inalámbricos, con cancelación de ruido y 30 horas de batería.', precio: 199900, unidades: 12, descuento: 0.15, disponible: true,  caracteristicas: ['audio', 'bluetooth', 'inalámbrico'], img_url: img('audifonos') },
  { id: 2,  categoria: 'Tecnología', nombre: 'Teclado Mecánico RGB',      'descripción': 'Switches azules, retroiluminación RGB y teclas programables.', precio: 249900, unidades: 30, descuento: 0,    disponible: true,  caracteristicas: ['gaming', 'RGB'], img_url: img('teclado') },
  { id: 3,  categoria: 'Tecnología', nombre: 'Mouse Inalámbrico Pro',     'descripción': 'Sensor de alta precisión y carga por USB-C.', precio: 89900,  unidades: 25, descuento: 0.10, disponible: true,  caracteristicas: ['inalámbrico', 'USB-C'], img_url: img('mouse') },
  { id: 4,  categoria: 'Tecnología', nombre: 'Parlante Portátil Mini',    'descripción': 'Resistente al agua, ideal para llevar a todas partes.', precio: 129900, unidades: 0,  descuento: 0,    disponible: false, caracteristicas: ['audio', 'portátil'], img_url: img('parlante') },
  { id: 5,  categoria: 'Tecnología', nombre: 'Smartwatch Fit 3',          'descripción': 'Ritmo cardíaco, pasos, sueño y notificaciones.', precio: 319900, unidades: 8,  descuento: 0.20, disponible: true,  caracteristicas: ['salud', 'bluetooth'], img_url: img('reloj') },

  { id: 6,  categoria: 'Ropa', nombre: 'Camiseta Básica Algodón', 'descripción': '100% algodón, corte clásico, varios colores.', precio: 49900,  unidades: 40, descuento: 0,    disponible: true, caracteristicas: ['algodón', 'unisex'], img_url: img('camiseta') },
  { id: 7,  categoria: 'Ropa', nombre: 'Buzo Oversize Lila',      'descripción': 'Felpa suave por dentro, capota y bolsillo canguro.', precio: 139900, unidades: 15, descuento: 0.25, disponible: true, caracteristicas: ['oversize', 'invierno'], img_url: img('buzo') },
  { id: 8,  categoria: 'Ropa', nombre: 'Jean Recto Clásico',      'descripción': 'Denim resistente con un toque de elasticidad.', precio: 159900, unidades: 20, descuento: 0,    disponible: true, caracteristicas: ['denim'], img_url: img('jean') },
  { id: 9,  categoria: 'Ropa', nombre: 'Gorra Bordada',           'descripción': 'Ajustable, con logo bordado al frente.', precio: 39900,  unidades: 35, descuento: 0.10, disponible: true, caracteristicas: ['accesorio', 'unisex'], img_url: img('gorra') },

  { id: 10, categoria: 'Hogar', nombre: 'Silla Gamer ProMax',    'descripción': 'Reclinable, con soporte lumbar y cojín cervical.', precio: 399900, unidades: 5,  descuento: 0.15, disponible: true,  caracteristicas: ['ergonómica', 'gaming'], img_url: img('silla') },
  { id: 11, categoria: 'Hogar', nombre: 'Lámpara de Escritorio', 'descripción': 'Luz LED regulable en 3 tonos.', precio: 79900,  unidades: 18, descuento: 0,    disponible: true,  caracteristicas: ['LED', 'escritorio'], img_url: img('lampara') },
  { id: 12, categoria: 'Hogar', nombre: 'Set de Tazas x4',       'descripción': 'Cerámica esmaltada, aptas para microondas.', precio: 59900,  unidades: 0,  descuento: 0,    disponible: false, caracteristicas: ['cocina', 'cerámica'], img_url: img('tazas') },
  { id: 13, categoria: 'Hogar', nombre: 'Planta Decorativa',     'descripción': 'Planta artificial en matera de concreto.', precio: 45900,  unidades: 22, descuento: 0.05, disponible: true,  caracteristicas: ['decoración'], img_url: img('planta') },

  { id: 14, categoria: 'Deportes', nombre: 'Mat de Yoga Antideslizante', 'descripción': '6 mm de grosor, con correa para llevarlo.', precio: 69900,  unidades: 14, descuento: 0,    disponible: true, caracteristicas: ['yoga', 'fitness'], img_url: img('yoga') },
  { id: 15, categoria: 'Deportes', nombre: 'Botella Térmica 1L',         'descripción': 'Mantiene frío 24 h y caliente 12 h.', precio: 54900,  unidades: 30, descuento: 0.10, disponible: true, caracteristicas: ['acero', 'térmica'], img_url: img('botella') },
  { id: 16, categoria: 'Deportes', nombre: 'Mancuernas Ajustables',      'descripción': 'Par de mancuernas de 2 a 10 kg.', precio: 229900, unidades: 6,  descuento: 0,    disponible: true, caracteristicas: ['fuerza', 'fitness'], img_url: img('pesas') },
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
