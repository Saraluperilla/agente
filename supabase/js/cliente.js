// cliente.js: la tienda del cliente, CON Supabase.
//
// Tienda RICCIO:
//   1) Sin sesión solo se ve la pantalla de acceso (login / registro):
//      no se pueden ver productos ni usar el carrito.
//   2) Con sesión: banner, filtros en menú desplegable y cuadrícula de productos
//      que salen de la tabla productos_practica.
//   3) "Ir a pagar" muestra un resumen del pedido (simulado: no se guarda en
//      la base de datos ni descuenta unidades).
//
// Usa "db", el cliente que crea supabaseClient.js (se carga antes).

// ===================== Estado =====================
let products = [];        // filas de productos_practica
let categories = [];      // categorías sin repetir
let currentUser = null;   // usuario de Auth (null = sin sesión)
let currentProfile = null; // su fila en clientes_practica

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

  cart = loadCart();   // el carrito se valida contra los productos reales
  buildFilterOptions();
  renderGrid();
  renderCart();
}

document.getElementById('btn-retry').addEventListener('click', loadProducts);

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
gridEl.addEventListener('click', (event) => {
  const open = event.target.closest('[data-open]');
  const add = event.target.closest('[data-add]');

  if (add) {
    addToCart(Number(add.dataset.add), 1);
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

dialog.addEventListener('click', (event) => {
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
    addToCart(Number(addBtn.dataset.dialogAdd), qty);
    dialog.close();
    return;
  }

  // Botón "Completar mi dirección" del resumen de pedido
  if (event.target.closest('[data-go-profile]')) {
    dialog.close();
    openDrawer(accountDrawer);
    document.getElementById('profile-address').focus();
  }
});

// ===================== Carrito =====================
// Se guarda en localStorage como [{ id, cantidad }]. Usa una llave distinta
// a la de galeria.html porque allá los ids son de prueba, no de Supabase.

const CART_KEY = 'tiendaCarrito';
let cart = [];

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    // Quita lo que ya no existe o se agotó, y ajusta cantidades al stock actual
    return saved
      .filter((item) => findProduct(item.id) && !isSoldOut(findProduct(item.id)))
      .map((item) => ({ ...item, cantidad: Math.min(item.cantidad, findProduct(item.id).unidades) }));
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
  // Sin sesión no se puede comprar (la pantalla de acceso ya lo impide; esto es un seguro extra)
  if (!currentUser) {
    showToast('Inicia sesión para agregar productos');
    return;
  }
  const product = findProduct(id);
  if (!product) return;
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
    .filter((item) => item.cantidad > 0);
  saveCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveCart();
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
        <button type="button" class="link-button" data-close-drawer>Seguir comprando</button>
      </li>`;
    cartSummary.hidden = true;
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

cartList.addEventListener('click', (event) => {
  const step = event.target.closest('[data-cart-step]');
  const remove = event.target.closest('[data-remove]');
  if (step) changeQuantity(Number(step.dataset.id), Number(step.dataset.cartStep));
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

// ===================== Paneles laterales (cuenta y carrito) =====================
// Los dos usan .drawer de galeria.css y comparten el mismo fondo oscuro.

const accountDrawer = document.getElementById('account-drawer');
const cartDrawer = document.getElementById('cart-drawer');
const backdrop = document.getElementById('backdrop');
const btnOpenCart = document.getElementById('btn-open-cart');
const btnOpenAccount = document.getElementById('btn-open-account');
let lastFocus = null;   // para devolver el foco al botón que abrió el panel

function openDrawer(drawer) {
  closeDrawers(false);   // solo un panel abierto a la vez
  lastFocus = drawer === cartDrawer ? btnOpenCart : btnOpenAccount;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  document.body.classList.add('no-scroll');
  drawer.querySelector('[data-close-drawer]').focus();
}

function closeDrawers(restoreFocus = true) {
  [accountDrawer, cartDrawer].forEach((drawer) => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
  });
  backdrop.hidden = true;
  document.body.classList.remove('no-scroll');
  if (restoreFocus && lastFocus) lastFocus.focus();
}

btnOpenCart.addEventListener('click', () => openDrawer(cartDrawer));
btnOpenAccount.addEventListener('click', () => openDrawer(accountDrawer));
backdrop.addEventListener('click', () => closeDrawers());

// Cualquier botón con data-close-drawer (las ✕ y "Seguir comprando") cierra
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-close-drawer]')) closeDrawers();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !backdrop.hidden) closeDrawers();
});

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
  currentUser = user;
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
  accountLabel.textContent = 'Mi cuenta';
  document.getElementById('banner-greeting').textContent = '';
  formProfile.reset();
  guestView.hidden = false;
  userView.hidden = true;
  showTab('login');
  lockStore();
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
  storeEl.hidden = false;
  if (products.length === 0) loadProducts();
}

function lockStore() {
  closeDrawers(false);
  document.body.classList.add('is-locked');
  authGate.hidden = false;
  storeEl.hidden = true;
  window.scrollTo(0, 0);
}

// ===================== Pagar (simulado) =====================
// No guarda nada en Supabase ni descuenta unidades: muestra el resumen
// del pedido y vacía el carrito, como lo haría una tienda real.

document.getElementById('btn-checkout').addEventListener('click', () => {
  if (cart.length === 0) return;

  if (!currentUser) {
    setNotice('Inicia sesión o crea una cuenta para terminar tu compra. Tu carrito se guarda.', 'info');
    lockStore();
    return;
  }

  const { total } = cartTotals();
  const address = currentProfile?.direccion;
  // Número de pedido de mentira: fecha + 4 cifras al azar
  const orderNumber = `${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const lines = cart.map(({ id, cantidad }) => {
    const p = findProduct(id);
    return `<li><span>${cantidad} × ${escapeHtml(p.nombre)}</span><strong>${formatPrice(finalPrice(p) * cantidad)}</strong></li>`;
  }).join('');

  dialog.innerHTML = `
    <div class="dialog-body receipt">
      <button type="button" class="icon-button dialog-close" data-close aria-label="Cerrar">✕</button>
      <p class="receipt-icon" aria-hidden="true">🎉</p>
      <h2 id="dialog-title">¡Pedido confirmado!</h2>
      <p class="description">Pedido <strong>#${orderNumber}</strong> · ${escapeHtml(currentProfile?.nombre || currentUser.email)}</p>
      <ul class="receipt-list">${lines}</ul>
      <p class="summary-row total"><span>Total pagado</span><span>${formatPrice(total)}</span></p>
      ${address
        ? `<p class="description">📦 Enviaremos a: <strong>${escapeHtml(address)}</strong></p>`
        : `<p class="description">📦 No tienes dirección guardada.</p>
           <button type="button" class="link-button" data-go-profile>Completar mi dirección</button>`}
      <p class="muted"><small>Compra de práctica: no se cobra nada ni se descuentan unidades.</small></p>
      <button type="button" class="primary" data-close>Seguir comprando</button>
    </div>
  `;
  dialog.classList.add('is-receipt');

  cart = [];
  saveCart();
  closeDrawers(false);
  dialog.showModal();
});

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

// Los productos se cargan después del login (en unlockStore), no antes.
renderCart();
checkSession();
