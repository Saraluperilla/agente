// cliente.js: la tienda del cliente, CON Supabase.
//
// Tienda RICCIO:
//   1) Sin sesión solo se ve la pantalla de acceso (login / registro):
//      no se pueden ver productos ni usar el carrito.
//   2) Con sesión: banner, filtros en menú desplegable y cuadrícula de productos
//      que salen de la tabla productos_practica.
//   3) El carrito vive en Supabase (pedidos + detalles_pedidos). "Ir a pagar"
//      pide los datos de envío y confirma con la función confirmar_pedido().
//
// Usa "db", el cliente que crea supabaseClient.js (se carga antes).

// ===================== Estado =====================
let products = [];        // filas de productos_practica
let categories = [];      // categorías sin repetir
let currentUser = null;   // usuario de Auth (null = sin sesión)
let currentProfile = null; // su fila en clientes_practica
// Promesa de loadProducts(): se resuelve cuando terminó la carga (bien o con error).
// loadCartFromDb() la espera, porque para dibujar el carrito necesita los productos.
let productsReady = null;

// ===================== Utilidades =====================

const formatPrice = (value) => `$${Math.round(value).toLocaleString('es-CO')}`;
const finalPrice = (product) => product.precio * (1 - (product.descuento || 0));
const findProduct = (id) => products.find((p) => p.id === id);
const isSoldOut = (product) => !product.disponible || product.unidades <= 0;

// Si la columna "categoria" todavía no existe (o está vacía), el producto
// cae en "Otros". Así la página funciona antes y después de correr el SQL.
const categoryOf = (product) => product.categoria || 'Otros';

const normalize = (text) => String(text).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const slug = (text) => normalize(text).replace(/\s+/g, '-');

// Los datos vienen de la base de datos y van a innerHTML: si un nombre
// trae "<", el navegador lo leería como HTML. escapeHtml lo vuelve texto.
const escapeHtml = (text) => String(text ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ===================== Cargar productos =====================

const gridEl = document.getElementById('product-grid');
const emptySearchEl = document.getElementById('empty-search');
const emptyTextEl = document.getElementById('empty-text');
const searchInput = document.getElementById('search-input');
const loadingEl = document.getElementById('loading');
const loadErrorEl = document.getElementById('load-error');
const resultsCountEl = document.getElementById('results-count');

async function loadProducts() {
  loadingEl.hidden = false;
  loadErrorEl.hidden = true;

  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .order('id');

  loadingEl.hidden = true;

  if (error) {
    console.log('Error al leer productos:', error);
    loadErrorEl.hidden = false;
    return;
  }

  products = data;
  categories = [...new Set(products.map(categoryOf))];

  buildFilterOptions();
  renderGrid();
  renderCart();
}

// Reintentar: vuelve a cargar productos y, con ellos, el carrito de la BD
document.getElementById('btn-retry').addEventListener('click', () => {
  productsReady = loadProducts();
  loadCartFromDb();
});

// ===================== Tarjeta de producto =====================

function createCard(product) {
  const percent = Math.round((product.descuento || 0) * 100);
  const soldOut = isSoldOut(product);
  const name = escapeHtml(product.nombre);

  return `
    <article class="product-card ${soldOut ? 'is-sold-out' : ''}">
      <button type="button" class="card-open" data-open="${product.id}" aria-label="Ver detalle de ${name}">
        <span class="card-media">
          <img src="${escapeHtml(product.img_url)}" alt="" loading="lazy">
          ${percent > 0 ? `<span class="badge">-${percent}%</span>` : ''}
          ${soldOut ? '<span class="badge badge-muted">Agotado</span>' : ''}
        </span>
        <span class="card-body">
          <span class="card-title">${name}</span>
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

// ===================== Filtros =====================
// Cada grupo guarda lo elegido en un Set (no permite repetidos).
// Regla: DENTRO de un grupo basta con cumplir UNA opción (Champús o Mascarillas);
// ENTRE grupos hay que cumplir TODOS (Mascarillas Y Nutrición Y menos de $50.000).

// Las necesidades capilares van en "caracteristicas", junto a la presentación ("500 ml").
const NEEDS = ['Hidratación', 'Definición', 'Nutrición', 'Limpieza', 'Control del frizz'];

// Rangos de precio: se comparan con el precio FINAL (ya con descuento)
const PRICE_RANGES = [
  { id: 'bajo',  label: 'Menos de $40.000',  test: (v) => v < 40000 },
  { id: 'medio', label: '$40.000 – $49.999', test: (v) => v >= 40000 && v < 50000 },
  { id: 'alto',  label: '$50.000 o más',     test: (v) => v >= 50000 },
];

const filters = {
  categories: new Set(),
  needs: new Set(),
  prices: new Set(),
  sale: false,      // solo en oferta
  inStock: false,   // ocultar agotados
  sort: '',
};

const filterPanel = document.getElementById('filter-panel');
const btnFilters = document.getElementById('btn-filters');
const filterCountEl = document.getElementById('filter-count');
const activeFiltersEl = document.getElementById('active-filters');
const sortSelect = document.getElementById('sort-select');
const saleCheckbox = document.getElementById('filter-sale');
const stockCheckbox = document.getElementById('filter-stock');

const hasNeed = (product, need) => (product.caracteristicas || []).includes(need);

// Opciones con casilla. El número de al lado dice cuántos productos tienen esa opción.
function optionHtml(group, value, label, count) {
  return `
    <label class="filter-option">
      <input type="checkbox" data-group="${group}" value="${escapeHtml(value)}" ${filters[group].has(value) ? 'checked' : ''}>
      ${escapeHtml(label)} <small>${count}</small>
    </label>`;
}

function buildFilterOptions() {
  document.getElementById('filter-categories').innerHTML = categories
    .map((cat) => optionHtml('categories', cat, cat, products.filter((p) => categoryOf(p) === cat).length))
    .join('');
  document.getElementById('filter-needs').innerHTML = NEEDS
    .map((need) => optionHtml('needs', need, need, products.filter((p) => hasNeed(p, need)).length))
    .join('');
  document.getElementById('filter-prices').innerHTML = PRICE_RANGES
    .map((r) => optionHtml('prices', r.id, r.label, products.filter((p) => r.test(finalPrice(p))).length))
    .join('');
}

function matchesFilters(p) {
  const q = normalize(searchInput.value.trim());
  if (q && !normalize(`${p.nombre} ${categoryOf(p)} ${(p.caracteristicas || []).join(' ')}`).includes(q)) return false;
  if (filters.categories.size && !filters.categories.has(categoryOf(p))) return false;
  if (filters.needs.size && ![...filters.needs].some((need) => hasNeed(p, need))) return false;
  if (filters.prices.size && !PRICE_RANGES.some((r) => filters.prices.has(r.id) && r.test(finalPrice(p)))) return false;
  if (filters.sale && !(p.descuento > 0)) return false;
  if (filters.inStock && isSoldOut(p)) return false;
  return true;
}

const SORTERS = {
  '': (a, b) => a.id - b.id,
  'precio-asc': (a, b) => finalPrice(a) - finalPrice(b),
  'precio-desc': (a, b) => finalPrice(b) - finalPrice(a),
  nombre: (a, b) => a.nombre.localeCompare(b.nombre, 'es'),
};

const activeCount = () =>
  filters.categories.size + filters.needs.size + filters.prices.size + (filters.sale ? 1 : 0) + (filters.inStock ? 1 : 0);

function renderGrid() {
  const list = products.filter(matchesFilters).sort(SORTERS[filters.sort]);

  gridEl.innerHTML = list.map(createCard).join('');
  resultsCountEl.textContent = `${list.length} ${list.length === 1 ? 'producto' : 'productos'}`;

  emptySearchEl.hidden = list.length > 0 || products.length === 0;
  emptyTextEl.textContent = searchInput.value.trim()
    ? `No encontramos productos con "${searchInput.value.trim()}" y esos filtros.`
    : 'No hay productos con esos filtros.';

  const count = activeCount();
  filterCountEl.textContent = count;
  filterCountEl.hidden = count === 0;
  document.getElementById('btn-close-filters').textContent = `Ver ${list.length} ${list.length === 1 ? 'resultado' : 'resultados'}`;
  renderActiveChips();
}

// Chips de lo que está filtrado: tocar uno quita ese filtro
function renderActiveChips() {
  const priceLabel = (id) => PRICE_RANGES.find((r) => r.id === id).label;
  const chips = [
    ...[...filters.categories].map((v) => ['categories', v, v]),
    ...[...filters.needs].map((v) => ['needs', v, v]),
    ...[...filters.prices].map((v) => ['prices', v, priceLabel(v)]),
    ...(filters.sale ? [['sale', '', 'En oferta']] : []),
    ...(filters.inStock ? [['inStock', '', 'Disponibles']] : []),
  ];
  activeFiltersEl.innerHTML = chips.map(([group, value, label]) => `
    <button type="button" class="active-chip" data-remove-group="${group}" data-remove-value="${escapeHtml(value)}"
            aria-label="Quitar filtro ${escapeHtml(label)}">${escapeHtml(label)} <span aria-hidden="true">✕</span></button>`).join('');
}

activeFiltersEl.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-remove-group]');
  if (!chip) return;
  const { removeGroup: group, removeValue: value } = chip.dataset;
  if (group === 'sale' || group === 'inStock') filters[group] = false;
  else filters[group].delete(value);
  syncFilterInputs();
  renderGrid();
});

// Las casillas del panel siguen a "filters" (por ejemplo, al quitar un chip)
function syncFilterInputs() {
  filterPanel.querySelectorAll('[data-group]').forEach((box) => {
    box.checked = filters[box.dataset.group].has(box.value);
  });
  saleCheckbox.checked = filters.sale;
  stockCheckbox.checked = filters.inStock;
}

// Un solo listener para todas las casillas del panel (delegación de eventos).
// Los resultados se actualizan al instante, sin cerrar el menú.
filterPanel.addEventListener('change', (event) => {
  const box = event.target;
  if (box === saleCheckbox) filters.sale = box.checked;
  else if (box === stockCheckbox) filters.inStock = box.checked;
  else if (box.dataset.group) {
    const set = filters[box.dataset.group];
    if (box.checked) set.add(box.value);
    else set.delete(box.value);
  }
  renderGrid();
});

function clearFilters() {
  filters.categories.clear();
  filters.needs.clear();
  filters.prices.clear();
  filters.sale = false;
  filters.inStock = false;
  searchInput.value = '';
  syncFilterInputs();
  renderGrid();
}

document.getElementById('btn-clear-filters').addEventListener('click', clearFilters);
document.getElementById('btn-empty-clear').addEventListener('click', clearFilters);

sortSelect.addEventListener('change', () => {
  filters.sort = sortSelect.value;
  renderGrid();
});

// ----- Abrir / cerrar el menú desplegable -----
function setFilterPanel(open) {
  filterPanel.hidden = !open;
  btnFilters.setAttribute('aria-expanded', String(open));
}

btnFilters.addEventListener('click', () => setFilterPanel(filterPanel.hidden));
document.getElementById('btn-close-filters').addEventListener('click', () => {
  setFilterPanel(false);
  btnFilters.focus();
});

// Clic fuera del menú o tecla Escape: se cierra
document.addEventListener('click', (event) => {
  if (!filterPanel.hidden && !filterPanel.contains(event.target) && !btnFilters.contains(event.target)) {
    setFilterPanel(false);
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !filterPanel.hidden) {
    setFilterPanel(false);
    btnFilters.focus();
  }
});

// ===================== Cuadrícula: clics y búsqueda =====================

// Delegación de eventos: un solo listener para todas las tarjetas
gridEl.addEventListener('click', async (event) => {
  const open = event.target.closest('[data-open]');
  const add = event.target.closest('[data-add]');

  if (add) {
    // Se desactiva mientras Supabase responde, para que un doble clic no envíe dos veces
    add.disabled = true;
    const ok = await addToCart(Number(add.dataset.add), 1);

    // Feedback 1,2 s en el mismo botón (sigue desactivado para no acumular clics).
    // renderCart() no hace falta: addToCart() ya lo llama vía saveCart().
    add.textContent = ok ? '✓ Agregado' : 'Error';
    add.classList.add(ok ? 'is-added' : 'is-error');
    setTimeout(() => {
      add.textContent = '+ Agregar';
      add.classList.remove('is-added', 'is-error');
      add.disabled = false;
    }, 1200);
  } else if (open) {
    openProduct(Number(open.dataset.open));
  }
});

let searchTimer = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(renderGrid, 200);
});

document.addEventListener('error', (event) => {
  if (event.target.tagName === 'IMG') event.target.classList.add('is-broken');
}, true);

// ===================== Detalle (dialog) =====================

const dialog = document.getElementById('product-dialog');

function openProduct(id) {
  const product = findProduct(id);
  if (!product) return;

  const percent = Math.round((product.descuento || 0) * 100);
  const soldOut = isSoldOut(product);
  const max = Math.max(product.unidades - quantityInCart(id), 0);

  dialog.innerHTML = `
    <div class="dialog-media">
      <img src="${escapeHtml(product.img_url)}" alt="${escapeHtml(product.nombre)}">
      ${percent > 0 ? `<span class="badge">-${percent}%</span>` : ''}
    </div>
    <div class="dialog-body">
      <button type="button" class="icon-button dialog-close" data-close aria-label="Cerrar">✕</button>
      <p class="pill">${escapeHtml(categoryOf(product))}</p>
      <h2 id="dialog-title">${escapeHtml(product.nombre)}</h2>
      <p class="price big">
        ${formatPrice(finalPrice(product))}
        ${percent > 0 ? `<s>${formatPrice(product.precio)}</s>` : ''}
      </p>
      <p class="description">${escapeHtml(product['descripción'])}</p>
      <ul class="tags">${(product.caracteristicas || []).map((c) => `<li>${escapeHtml(c)}</li>`).join('')}</ul>
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
  dialog.classList.remove('is-receipt');
  dialog.showModal();
}

dialog.addEventListener('click', async (event) => {
  if (event.target === dialog || event.target.closest('[data-close]')) {
    dialog.close();
    return;
  }

  const step = event.target.closest('[data-step]');
  if (step) {
    const stepper = step.closest('.stepper');
    const output = stepper.querySelector('output');
    const next = Number(output.textContent) + Number(step.dataset.step);
    output.textContent = Math.min(Math.max(next, 1), Number(stepper.dataset.max));
    return;
  }

  const addBtn = event.target.closest('[data-dialog-add]');
  if (addBtn) {
    const qty = Number(dialog.querySelector('#dialog-qty').textContent);
    addBtn.disabled = true;
    const added = await addToCart(Number(addBtn.dataset.dialogAdd), qty);
    addBtn.disabled = false;
    if (added) dialog.close();   // si falló, el diálogo queda abierto para reintentar
    return;
  }

  // Botón "Completar mi dirección" del resumen de pedido
  if (event.target.closest('[data-go-profile]')) {
    dialog.close();
    location.hash = 'cuenta';
    showView();   // se llama ya (hashchange llega después) para poder enfocar el campo visible
    document.getElementById('profile-address').focus();
  }
});

// ===================== Carrito =====================
// cart = [{ id, cantidad }] es solo la COPIA en pantalla. La fuente de verdad es
// Supabase (pedidos en estado 'carrito' + detalles_pedidos): al recargar, se
// vuelve a leer de ahí con loadCartFromDb(). Ya no se usa localStorage.

let cart = [];

// Se llama después de cada cambio en cart (nombre heredado de cuando guardaba en localStorage)
function saveCart() {
  renderCart();
}

const quantityInCart = (id) => cart.find((item) => item.id === id)?.cantidad || 0;

// ----- Carrito en Supabase -----
// cartOrder: la fila de "pedidos" en estado 'carrito' de este cliente (null = aún no se buscó).
// detailIds: { [productId]: id de su fila en detalles_pedidos }, para saber si toca UPDATE o INSERT.
let cartOrder = null;
let detailIds = {};

// Se llama al cerrar sesión o al entrar con otra cuenta: el carrito de la BD es por cliente.
function resetCartOrder() {
  cartOrder = null;
  detailIds = {};
}

// Vacía la copia local (pantalla) sin tocar la BD.
function clearLocalCart() {
  resetCartOrder();
  cart = [];
  renderCart();
}

// PASO 5: el carrito sobrevive a una recarga. Lo lee de Supabase en UNA consulta.
async function loadCartFromDb() {
  await productsReady;   // renderCart() necesita los productos para nombre, foto y precio
  clearLocalCart();
  if (!currentUser) return;
  if (products.length === 0) return;   // falló la carga de productos: el botón "Reintentar" vuelve a llamar aquí

  // Select anidado: detalles_pedidos(...) trae los detalles del pedido en la misma
  // respuesta, gracias a la FK detalles_pedidos.pedido_id -> pedidos.id.
  const { data: order, error } = await db
    .from('pedidos')
    .select('id, detalles_pedidos(id, producto_id, cantidad)')
    .eq('cliente_id', currentUser.id)
    .eq('estado', 'carrito')
    .maybeSingle();

  if (error) {
    console.log('Error al cargar el carrito:', error);
    return;
  }
  if (!order) return;   // todavía no tiene carrito: se crea al agregar el primer producto

  // Queda en caché: getOrCreateCart() ya no vuelve a consultar.
  // Se ASIGNA (no push) para no duplicar si el cliente agregó algo mientras llegaba la respuesta.
  cartOrder = { id: order.id };
  cart = order.detalles_pedidos.map((detail) => ({ id: detail.producto_id, cantidad: detail.cantidad }));
  detailIds = {};
  order.detalles_pedidos.forEach((detail) => { detailIds[detail.producto_id] = detail.id; });
  renderCart();
}

// PASO 1: busca el carrito abierto del cliente; si no tiene, lo crea.
// Devuelve la fila { id } de pedidos, o null si algo falló.
async function getOrCreateCart() {
  if (cartOrder) return cartOrder;   // ya se buscó antes en esta sesión

  // RLS ("ver_pedidos") ya filtra a los pedidos propios; el .eq() lo deja explícito.
  // maybeSingle(): null sin error si no hay ninguno. Nunca hay más de uno gracias al
  // índice único parcial pedidos_un_carrito_por_cliente.
  const { data: found, error: findError } = await db
    .from('pedidos')
    .select('id')
    .eq('cliente_id', currentUser.id)
    .eq('estado', 'carrito')
    .maybeSingle();
  if (findError) {
    console.log('Error al buscar el carrito:', findError);
    return null;
  }

  let order = found;
  if (!order) {
    // Solo se envía cliente_id (único permiso de columna para INSERT en pedidos);
    // estado toma su default 'carrito'.
    const { data: created, error: createError } = await db
      .from('pedidos')
      .insert([{ cliente_id: currentUser.id }])
      .select('id')
      .single();
    if (createError) {
      // 23503 = no existe tu fila en clientes_practica (pedidos.cliente_id la exige)
      console.log('Error al crear el carrito:', createError);
      return null;
    }
    order = created;
  }

  // Si el carrito ya existía (p. ej. recargaste la página), trae sus detalles para
  // llenar detailIds. Sin esto, el siguiente INSERT del mismo producto chocaría con
  // el unique (pedido_id, producto_id) -> error 23505.
  const { data: details, error: detailsError } = await db
    .from('detalles_pedidos')
    .select('id, producto_id')
    .eq('pedido_id', order.id);
  if (detailsError) {
    console.log('Error al leer los detalles del carrito:', detailsError);
    return null;
  }
  details.forEach((detail) => { detailIds[detail.producto_id] = detail.id; });

  cartOrder = order;
  return cartOrder;
}

// PASO 2: agrega qty unidades del producto id. Devuelve true si salió bien.
async function addToCart(id, qty) {
  // Sin sesión no se puede comprar (la pantalla de acceso ya lo impide; esto es un seguro extra)
  if (!currentUser) {
    showToast('Inicia sesión para agregar productos');
    return false;
  }
  const product = findProduct(id);
  if (!product) return false;
  const current = quantityInCart(id);
  const allowed = Math.min(qty, product.unidades - current);

  if (allowed <= 0) {
    showToast(`Ya tienes todas las unidades de ${product.nombre}`);
    return false;
  }

  const order = await getOrCreateCart();
  if (!order) {
    showToast('No se pudo agregar al carrito');
    return false;
  }

  const newQuantity = current + allowed;

  if (detailIds[id]) {
    // Ya está en el carrito de la BD: solo cambia la cantidad.
    const { data, error } = await db
      .from('detalles_pedidos')
      .update({ cantidad: newQuantity })
      .eq('id', detailIds[id])
      .select();
    // Si RLS bloquea el update (el pedido ya no está en 'carrito') no hay error: llegan 0 filas
    if (error || data.length === 0) {
      console.log('Error al actualizar la cantidad:', error ?? 'RLS bloqueó el update (0 filas)');
      showToast('No se pudo agregar al carrito');
      return false;
    }
  } else {
    // Producto nuevo en el carrito. NUNCA se envía precio_unitario: no hay permiso
    // de columna para eso y lo copia el trigger detalles_pedidos_fijar_precio.
    const { data, error } = await db
      .from('detalles_pedidos')
      .insert([{ pedido_id: order.id, producto_id: id, cantidad: newQuantity }])
      .select('id')
      .single();
    if (error) {
      console.log('Error al agregar el producto:', error);
      showToast('No se pudo agregar al carrito');
      return false;
    }
    detailIds[id] = data.id;
  }

  // La BD ya quedó bien: ahora sí se actualiza el carrito local y la pantalla.
  if (current > 0) {
    cart = cart.map((item) => item.id === id ? { ...item, cantidad: newQuantity } : item);
  } else {
    cart = [...cart, { id, cantidad: newQuantity }];
  }
  saveCart();
  showToast(`✓ ${product.nombre} agregado (${allowed})`);
  bumpCartButton();
  return true;
}

// Botones + y − del carrito. delta = 1 o -1. Devuelve true si salió bien.
async function changeQuantity(id, delta) {
  const product = findProduct(id);
  const current = quantityInCart(id);
  const newQuantity = Math.min(current + delta, product.unidades);

  if (newQuantity <= 0) return removeFromCart(id);   // bajar de 1 = quitar (DELETE)
  if (newQuantity === current) return true;          // tope de stock: nada que cambiar

  // Asegura que detailIds esté cargado (igual que en removeFromCart)
  const order = await getOrCreateCart();
  if (!order || !detailIds[id]) {
    console.log('No se encontró el detalle del producto', id, 'en el carrito de la BD');
    showToast('No se pudo cambiar la cantidad');
    return false;
  }

  // La BD guarda la cantidad TOTAL (no el +1/−1): así no importa cuántas veces se repita
  const { data, error } = await db
    .from('detalles_pedidos')
    .update({ cantidad: newQuantity })
    .eq('id', detailIds[id])
    .select();
  if (error || data.length === 0) {
    console.log('Error al cambiar la cantidad:', error ?? 'RLS bloqueó el update (0 filas)');
    showToast('No se pudo cambiar la cantidad');
    return false;   // la pantalla NO cambia: sigue igual que la BD
  }

  cart = cart.map((item) => item.id === id ? { ...item, cantidad: newQuantity } : item);
  saveCart();
  return true;
}

// PASO 4: quita el producto id del carrito. Devuelve true si salió bien.
// El pedido NO se borra aunque quede vacío: el mismo carrito se reutiliza.
async function removeFromCart(id) {
  if (currentUser) {
    // Asegura que detailIds esté cargado (tras recargar la página aún no se ha leído
    // el carrito de la BD: sin esto, la fila quedaría huérfana en detalles_pedidos).
    const order = await getOrCreateCart();
    if (!order) {
      showToast('No se pudo quitar el producto');
      return false;
    }

    if (detailIds[id]) {
      const { data, error } = await db
        .from('detalles_pedidos')
        .delete()
        .eq('id', detailIds[id])
        .select();
      // Igual que en el update: si RLS ("quitar_detalle") bloquea, no hay error, llegan 0 filas
      if (error || data.length === 0) {
        console.log('Error al quitar el producto:', error ?? 'RLS bloqueó el delete (0 filas)');
        showToast('No se pudo quitar el producto');
        return false;   // el carrito local NO se toca: sigue igual que la BD
      }
      delete detailIds[id];
    }
  }

  // Con o sin sesión: se quita del carrito local y se vuelve a dibujar (saveCart -> renderCart)
  cart = cart.filter((item) => item.id !== id);
  saveCart();
  return true;
}

const cartList = document.getElementById('cart-list');
const cartCount = document.getElementById('cart-count');
const cartSummary = document.getElementById('cart-summary');

const cartTotals = () => {
  const subtotal = cart.reduce((sum, { id, cantidad }) => sum + findProduct(id).precio * cantidad, 0);
  const total = cart.reduce((sum, { id, cantidad }) => sum + finalPrice(findProduct(id)) * cantidad, 0);
  return { subtotal, total };
};

function renderCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
  cartCount.textContent = totalItems;
  cartCount.hidden = totalItems === 0;

  if (cart.length === 0) {
    cartList.innerHTML = `
      <li class="cart-empty">
        <span aria-hidden="true">🛍️</span>
        <p>Tu carrito está vacío.</p>
        <a class="link-button" href="#inicio">Seguir comprando</a>
      </li>`;
    cartSummary.hidden = true;
    hideCheckoutForm();   // si se vació con el form abierto, la próxima vez empieza de cero
    return;
  }

  cartList.innerHTML = cart.map(({ id, cantidad }) => {
    const p = findProduct(id);
    return `
      <li class="cart-item">
        <img src="${escapeHtml(p.img_url)}" alt="">
        <div class="cart-info">
          <strong>${escapeHtml(p.nombre)}</strong>
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

  const { subtotal, total } = cartTotals();
  document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
  document.getElementById('cart-savings').textContent = `−${formatPrice(subtotal - total)}`;
  document.getElementById('cart-savings-row').hidden = Math.round(subtotal) === Math.round(total);
  document.getElementById('cart-total').textContent = formatPrice(total);
  cartSummary.hidden = false;
}

cartList.addEventListener('click', async (event) => {
  const step = event.target.closest('[data-cart-step]');
  const remove = event.target.closest('[data-remove]');
  if (step) {
    // Se desactivan TODOS los botones de esa línea (+, − y Quitar) mientras Supabase
    // responde: así un + y un − rápidos no se pisan. Si sale bien, renderCart()
    // redibuja la línea con botones nuevos; si falla, se redibuja igual (sin cambios)
    // para que cada botón vuelva a su estado correcto (p. ej. + desactivado en el tope de stock).
    step.closest('.cart-item').querySelectorAll('button').forEach((b) => { b.disabled = true; });
    const ok = await changeQuantity(Number(step.dataset.id), Number(step.dataset.cartStep));
    if (!ok) renderCart();
  }
  if (remove) {
    // Desactivado mientras Supabase responde. Si sale bien, renderCart() redibuja
    // la lista y este botón desaparece; si falla, se vuelve a activar.
    remove.disabled = true;
    const ok = await removeFromCart(Number(remove.dataset.remove));
    if (!ok) remove.disabled = false;
  }
});

// ===================== Páginas: tienda, carrito, cuenta y pedidos =====================
// Cada página es una <section class="page"> de cliente.html. Se muestra UNA
// según el #hash de la URL (como vistas.js en el admin):
//   cliente.html#carrito  #cuenta  #pedidos   -> esa página
//   cualquier otro hash (o ninguno)            -> la tienda (#inicio)
// Los links del header solo cambian el hash; "hashchange" llama a showView().
// Ventaja: Atrás/Adelante del navegador funcionan y al recargar no se pierde la página.

const VIEWS = ['carrito', 'cuenta', 'pedidos'];
const pageEls = Object.fromEntries(VIEWS.map((view) => [view, document.getElementById(view)]));
const btnOpenCart = document.getElementById('btn-open-cart');
const btnOpenAccount = document.getElementById('btn-open-account');
const btnOpenOrders = document.getElementById('btn-open-orders');
const headerLinks = { carrito: btnOpenCart, cuenta: btnOpenAccount, pedidos: btnOpenOrders };

// "#pedidos" -> "pedidos". Si no es una página conocida, es la tienda.
function currentView() {
  const view = location.hash.slice(1);
  return VIEWS.includes(view) ? view : 'inicio';
}

function showView() {
  // Sin sesión solo se ve la pantalla de acceso (lockStore oculta todo)
  if (document.body.classList.contains('is-locked')) return;

  const view = currentView();
  storeEl.hidden = view !== 'inicio';
  VIEWS.forEach((name) => { pageEls[name].hidden = name !== view; });

  // Marca en el header la página activa (el CSS la resalta; los lectores de pantalla la anuncian)
  Object.entries(headerLinks).forEach(([name, link]) => {
    if (name === view) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // Cada vez que se entra a Mis pedidos se vuelven a leer: así se ve si el admin cambió un estado
  if (view === 'pedidos') loadMyOrders();

  window.scrollTo(0, 0);   // cada página empieza desde arriba
}

window.addEventListener('hashchange', showView);

// ===================== Cuenta =====================

const guestView = document.getElementById('guest-view');
const userView = document.getElementById('user-view');
const accountNotice = document.getElementById('account-notice');
const accountLabel = document.getElementById('account-label');
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const formProfile = document.getElementById('form-profile');
const profileMessage = document.getElementById('profile-message');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

// Pestañas Iniciar sesión / Crear cuenta
function showTab(name) {
  const isLogin = name === 'login';
  formLogin.hidden = !isLogin;
  formRegister.hidden = isLogin;
  tabLogin.classList.toggle('is-active', isLogin);
  tabRegister.classList.toggle('is-active', !isLogin);
  tabLogin.setAttribute('aria-selected', isLogin);
  tabRegister.setAttribute('aria-selected', !isLogin);
}
tabLogin.addEventListener('click', () => showTab('login'));
tabRegister.addEventListener('click', () => showTab('register'));

function setNotice(text, type = '') {
  accountNotice.textContent = text;
  accountNotice.className = `form-message ${type}`;
}

// Mientras espera a Supabase, el botón se desactiva para evitar doble envío
async function withBusyButton(form, task) {
  const button = form.querySelector('button[type="submit"]');
  const original = button.textContent;
  button.disabled = true;
  button.textContent = 'Un momento…';
  try {
    await task();
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

// REGISTRO: crea el usuario en Auth y su perfil en clientes_practica
formRegister.addEventListener('submit', (event) => {
  event.preventDefault();
  withBusyButton(formRegister, async () => {
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    const { data, error } = await db.auth.signUp({ email, password });
    if (error) {
      console.log('Error al registrar:', error);
      setNotice(error.message.includes('registered')
        ? 'Ese correo ya tiene cuenta. Inicia sesión.'
        : 'No se pudo crear la cuenta. Revisa los datos.', 'error');
      return;
    }

    const { error: profileError } = await db
      .from('clientes_practica')
      .insert([{ id: data.user.id, nombre: name, correo: email, rol: 'cliente' }]);
    if (profileError) console.log('Error al crear el perfil:', profileError);

    formRegister.reset();

    // Si el proyecto exige confirmar el correo, signUp no deja sesión
    if (!data.session) {
      setNotice('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.', 'ok');
      showTab('login');
      return;
    }
    await loadProfile(data.user);
    showToast(`¡Bienvenido/a, ${name}!`);
  });
});

// LOGIN
formLogin.addEventListener('submit', (event) => {
  event.preventDefault();
  withBusyButton(formLogin, async () => {
    const { data, error } = await db.auth.signInWithPassword({
      email: document.getElementById('login-email').value.trim(),
      password: document.getElementById('login-password').value,
    });
    if (error) {
      console.log('Error al iniciar sesión:', error);
      setNotice('Correo o contraseña incorrectos.', 'error');
      return;
    }
    formLogin.reset();
    await loadProfile(data.user);
    showToast(`¡Hola de nuevo, ${currentProfile?.nombre || data.user.email}!`);
  });
});

// LEER el perfil y pasar a la vista "con sesión"
async function loadProfile(user) {
  // ¿Entró alguien nuevo? (recarga con sesión, login, o cambio de cuenta).
  // Al guardar "Mi cuenta" también se llama loadProfile, pero con el mismo usuario:
  // ahí no hace falta volver a leer el carrito.
  const isNewUser = currentUser?.id !== user.id;
  currentUser = user;
  if (isNewUser) loadCartFromDb();   // sin await: el carrito se dibuja cuando llegue
  const { data: profile, error } = await db
    .from('clientes_practica')
    .select('nombre, correo, telefono, direccion')
    .eq('id', user.id)
    .maybeSingle();   // null (sin error) si todavía no hay fila
  if (error) console.log('Error al leer el perfil:', error);

  currentProfile = profile;
  const name = profile?.nombre || user.email;

  document.getElementById('user-greeting').textContent = `¡Hola, ${name}!`;
  document.getElementById('user-email').textContent = user.email;
  document.getElementById('profile-name').value = profile?.nombre ?? '';
  document.getElementById('profile-phone').value = profile?.telefono ?? '';
  document.getElementById('profile-address').value = profile?.direccion ?? '';
  profileMessage.textContent = profile ? '' : 'Completa tus datos y guarda para crear tu perfil.';

  accountLabel.textContent = name.split(' ')[0];
  document.getElementById('banner-greeting').textContent = `Hola, ${name.split(' ')[0]} ✦ qué bueno verte de nuevo`;
  guestView.hidden = true;
  userView.hidden = false;
  unlockStore();
  setNotice('');
}

// ACTUALIZAR mis datos. Si el perfil no existía, lo crea (upsert).
formProfile.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!currentUser) return;
  withBusyButton(formProfile, async () => {
    // Solo estas 3 columnas: con sql/rls_clientes_practica.sql el cliente no
    // tiene permiso de UPDATE sobre id, correo ni rol (mandarlas daría error).
    const changes = {
      nombre: document.getElementById('profile-name').value.trim(),
      telefono: document.getElementById('profile-phone').value.trim(),
      direccion: document.getElementById('profile-address').value.trim(),
    };
    const { data, error } = currentProfile
      ? await db.from('clientes_practica').update(changes).eq('id', currentUser.id).select()
      : await db.from('clientes_practica')
          .insert([{ ...changes, id: currentUser.id, correo: currentUser.email, rol: 'cliente' }])
          .select();

    if (error) {
      console.log('Error al guardar el perfil:', error);
      profileMessage.textContent = 'No se pudieron guardar los cambios.';
      return;
    }
    // Si RLS bloquea el update, no hay error: llegan 0 filas
    if (data.length === 0) {
      profileMessage.textContent = 'No tienes permiso para editar este perfil (revisa RLS).';
      return;
    }
    await loadProfile(currentUser);
    profileMessage.textContent = 'Datos guardados ✔';
  });
});

// CERRAR SESIÓN
document.getElementById('btn-logout').addEventListener('click', async () => {
  const { error } = await db.auth.signOut();
  if (error) {
    console.log('Error al cerrar sesión:', error);
    return;
  }
  showGuest();
  showToast('Sesión cerrada');
});

function showGuest() {
  currentUser = null;
  currentProfile = null;
  clearLocalCart();   // el carrito sigue guardado en la BD; al volver a entrar se carga
  myOrdersList.innerHTML = '';   // que el próximo que entre no vea los pedidos de esta cuenta
  accountLabel.textContent = 'Mi cuenta';
  document.getElementById('banner-greeting').textContent = '';
  formProfile.reset();
  guestView.hidden = false;
  userView.hidden = true;
  showTab('login');
  lockStore();
  // Quita el #carrito / #cuenta / #pedidos de la URL: el próximo login empieza en la tienda.
  // replaceState cambia la URL sin agregar una entrada al historial (ni disparar hashchange).
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}

// ===================== Acceso obligatorio =====================
// La tienda (main) y el encabezado con carrito solo se muestran con sesión.
// Ojo: esto es solo lo que se VE. Lo que de verdad protege los datos son las
// políticas RLS de Supabase.

const authGate = document.getElementById('auth-gate');
const storeEl = document.getElementById('inicio');

function unlockStore() {
  document.body.classList.remove('is-locked');
  authGate.hidden = true;
  showView();   // la tienda o la página del #hash (p. ej. recargaste en #carrito)
}

function lockStore() {
  document.body.classList.add('is-locked');
  authGate.hidden = false;
  storeEl.hidden = true;
  VIEWS.forEach((name) => { pageEls[name].hidden = true; });   // carrito, cuenta y pedidos también
  window.scrollTo(0, 0);
}

// ===================== Checkout: formulario de envío =====================
// PASO 6: "Ir a pagar" muestra el formulario; el envío (confirmar_pedido) va en el paso 7.

const btnCheckout = document.getElementById('btn-checkout');
const formCheckout = document.getElementById('form-checkout');
const cartMessage = document.getElementById('cart-message');
const checkShipping = document.getElementById('checkout-shipping');
const checkoutAddress = document.getElementById('checkout-address');
const checkoutPhone = document.getElementById('checkout-phone');

// Vuelve al estado inicial: formulario oculto y botón "Ir a pagar" visible
function hideCheckoutForm() {
  formCheckout.hidden = true;
  btnCheckout.hidden = false;
}

// Dirección y teléfono son obligatorios SOLO con envío a domicilio.
// "required" hace que el navegador bloquee el submit y marque el campo vacío.
function updateShippingRequired() {
  checkoutAddress.required = checkShipping.checked;
  checkoutPhone.required = checkShipping.checked;
}

btnCheckout.addEventListener('click', () => {
  cartMessage.textContent = '';

  if (cart.length === 0) {
    cartMessage.textContent = 'Tu carrito está vacío.';
    return;
  }
  if (!currentUser) {
    // Seguro extra: sin sesión la tienda ya está bloqueada
    cartMessage.textContent = 'Para comprar, inicia sesión en Mi cuenta.';
    return;
  }

  // Precarga lo que el cliente guardó en "Mi cuenta" (sin pisar lo que ya escribió)
  if (!checkoutAddress.value) checkoutAddress.value = currentProfile?.direccion ?? '';
  if (!checkoutPhone.value) checkoutPhone.value = currentProfile?.telefono ?? '';
  updateShippingRequired();

  formCheckout.hidden = false;
  btnCheckout.hidden = true;
  checkShipping.focus();
});

document.getElementById('btn-cancel-checkout').addEventListener('click', hideCheckoutForm);

checkShipping.addEventListener('change', updateShippingRequired);

// Texto del campo sin espacios, o null si quedó vacío (la función de la BD espera null)
const textOrNull = (input) => input.value.trim() || null;

// PASO 7: confirmar el pedido. El navegador NO calcula el total ni cambia el estado:
// solo llama a confirmar_pedido(), que valida, descuenta stock, fija precios y
// pasa el pedido a 'confirmado' en UNA transacción.
formCheckout.addEventListener('submit', async (event) => {
  event.preventDefault();   // sin esto, el <form> recarga la página
  if (!cartOrder) {
    cartMessage.textContent = 'No encontramos tu carrito. Recarga la página e intenta de nuevo.';
    return;
  }

  const btnConfirm = document.getElementById('btn-confirm-order');
  btnConfirm.disabled = true;
  cartMessage.textContent = '';

  // Los nombres de los parámetros deben ser EXACTAMENTE los de la función en SQL
  const { data: order, error } = await db.rpc('confirmar_pedido', {
    p_pedido_id: cartOrder.id,
    p_envio: checkShipping.checked,
    p_direccion: textOrNull(checkoutAddress),
    p_telefono: textOrNull(checkoutPhone),
    p_observacion: textOrNull(document.getElementById('checkout-notes')),
  });

  if (error) {
    // El mensaje lo escribe la función con raise exception
    // (p. ej. 'Stock insuficiente para el producto 2'). El carrito NO se vacía.
    console.log('Error al confirmar el pedido:', error);
    cartMessage.textContent = error.message;
    btnConfirm.disabled = false;
    return;
  }

  // order = la fila del pedido ya confirmado. El total lo calcula la vista en la BD,
  // y las líneas salen de detalles_pedidos con el precio_unitario definitivo.
  const [{ data: totals, error: totalError }, { data: details, error: detailsError }] = await Promise.all([
    db.from('pedidos_con_total').select('total').eq('id', order.id).single(),
    db.from('detalles_pedidos')
      .select('cantidad, precio_unitario, productos_practica(nombre)')
      .eq('pedido_id', order.id),
  ]);
  // El pedido YA quedó confirmado: si estas lecturas fallan solo se avisa, no se revierte nada
  if (totalError) console.log('Error al leer el total:', totalError);
  if (detailsError) console.log('Error al leer los detalles:', detailsError);

  btnConfirm.disabled = false;
  formCheckout.reset();
  updateShippingRequired();      // casilla desmarcada -> quita required de dirección y teléfono
  clearLocalCart();              // el próximo producto creará un carrito nuevo
  productsReady = loadProducts(); // las unidades bajaron: se vuelve a leer el stock

  showReceipt(order, totals?.total ?? null, details ?? []);   // lleva a #pedidos, que se recarga solo
});

// Comprobante del pedido confirmado. TODO sale de la BD:
//   order   -> fila que devolvió confirmar_pedido() (id, envio, direccion...)
//   total   -> calculado por la vista pedidos_con_total (null si no se pudo leer)
//   details -> [{ cantidad, precio_unitario, productos_practica: { nombre } }]
function showReceipt(order, total, details) {
  const lines = details.map((d) => `
    <li>
      <span>${d.cantidad} × ${escapeHtml(d.productos_practica?.nombre ?? 'Producto')}</span>
      <strong>${formatPrice(d.precio_unitario * d.cantidad)}</strong>
    </li>`).join('');

  dialog.innerHTML = `
    <div class="dialog-body receipt">
      <button type="button" class="icon-button dialog-close" data-close aria-label="Cerrar">✕</button>
      <p class="receipt-icon" aria-hidden="true">🎉</p>
      <h2 id="dialog-title">¡Pedido confirmado!</h2>
      <p class="description">Pedido <strong>#${order.id}</strong> · ${escapeHtml(currentProfile?.nombre || currentUser.email)}</p>
      <ul class="receipt-list">${lines}</ul>
      <p class="summary-row total"><span>Total</span><span>${total === null ? '—' : formatPrice(total)}</span></p>
      <p class="description">
        ${order.envio
          ? `📦 Enviaremos a: <strong>${escapeHtml(order.direccion)}</strong>`
          : '🏬 Recoges tu pedido en tienda.'}
      </p>
      <p class="muted"><small>Compra de práctica: no se cobra nada.</small></p>
      <button type="button" class="primary" data-close>Seguir comprando</button>
    </div>
  `;
  dialog.classList.add('is-receipt');

  // Detrás del comprobante queda la página "Mis pedidos" (showView la recarga
  // con el pedido nuevo). Al cerrar el comprobante, el cliente ya lo ve ahí.
  location.hash = 'pedidos';
  dialog.showModal();
}

// ===================== Mis pedidos =====================
// Historial del cliente: todos sus pedidos menos el carrito abierto, con el estado
// ACTUAL (lo cambia el admin). Se lee al abrir "Mi cuenta", con "Actualizar" y
// después de confirmar un pedido. RLS ("ver_pedidos") deja ver solo los propios.

const STATUS_LABELS = {
  carrito: 'En carrito',
  confirmado: 'Confirmado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const myOrdersList = document.getElementById('my-orders-list');

// "2026-11-19T15:04:00Z" -> "19 nov 2026, 10:04 a. m." (hora de Colombia del navegador)
const formatDate = (value) => new Date(value)
  .toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

const statusBadge = (status) =>
  `<span class="status status-${status}">${STATUS_LABELS[status] ?? escapeHtml(status)}</span>`;

async function loadMyOrders() {
  if (!currentUser) return;
  myOrdersList.innerHTML = '<li class="muted">Cargando pedidos…</li>';

  // El total y el número de unidades los calcula la vista en la BD
  const { data: orders, error } = await db
    .from('pedidos_con_total')
    .select('id, estado, envio, direccion, created_at, confirmado_en, total, productos')
    .eq('cliente_id', currentUser.id)
    .neq('estado', 'carrito')
    .order('id', { ascending: false });

  if (error) {
    console.log('Error al leer mis pedidos:', error);
    myOrdersList.innerHTML = '<li class="muted">No se pudieron cargar tus pedidos.</li>';
    return;
  }
  if (orders.length === 0) {
    myOrdersList.innerHTML = '<li class="muted">Todavía no tienes pedidos.</li>';
    return;
  }

  // Los productos de TODOS los pedidos en una sola consulta (.in = "pedido_id está en la lista")
  const { data: details, error: detailsError } = await db
    .from('detalles_pedidos')
    .select('pedido_id, cantidad, productos_practica(nombre)')
    .in('pedido_id', orders.map((order) => order.id));
  if (detailsError) console.log('Error al leer los productos de mis pedidos:', detailsError);

  myOrdersList.innerHTML = orders.map((order) => {
    const items = (details ?? []).filter((d) => d.pedido_id === order.id);
    return `
      <li class="order-card">
        <div class="order-card-top">
          <strong>Pedido #${order.id}</strong>
          ${statusBadge(order.estado)}
        </div>
        <small>${formatDate(order.confirmado_en ?? order.created_at)}</small>
        <ul>
          ${items.map((d) => `<li>${d.cantidad} × ${escapeHtml(d.productos_practica?.nombre ?? 'Producto')}</li>`).join('')}
        </ul>
        <small>${order.envio ? `📦 Envío a ${escapeHtml(order.direccion)}` : '🏬 Recoges en tienda'}</small>
        <span class="order-total">Total: ${formatPrice(order.total)}</span>
      </li>`;
  }).join('');
}

document.getElementById('btn-refresh-orders').addEventListener('click', loadMyOrders);

// ===================== Toast y animación del carrito =====================

function bumpCartButton() {
  btnOpenCart.classList.remove('bump');
  void btnOpenCart.offsetWidth;
  btnOpenCart.classList.add('bump');
}

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
// Si ya había sesión (recargaste la página), se carga el perfil sin pedir login.
async function checkSession() {
  const { data } = await db.auth.getUser();
  if (data.user) await loadProfile(data.user);
  else showGuest();
}

// Arranque, en este orden:
// 1) Productos: se piden de una vez (la política "ver_productos" permite leerlos
//    sin sesión; la tienda igual queda oculta hasta el login).
// 2) Sesión: si hay usuario, loadProfile() llama a loadCartFromDb(), que espera
//    a productsReady antes de dibujar el carrito.
productsReady = loadProducts();
checkSession();
