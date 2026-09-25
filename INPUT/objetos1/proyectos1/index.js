// leerAnimales() viene de data.js (se carga antes que este script en
// index.html). Devuelve una copia de los datos: esta página solo los
// muestra, así que no necesita (ni puede) guardar cambios.
const animales = leerAnimales();

// Recibe UN objeto animal y devuelve el <div class="card"> ya armado,
// con una etiqueta HTML separada por cada propiedad (no un solo bloque
// de texto). Como no usa id, esta misma función sirve para las 10 tarjetas.
function crearCarta(animal) {
  const card = document.createElement("div");
  card.className = "card";

  // Imagen del animal: ahora ocupa toda la tarjeta como fondo
  // (position: absolute en el CSS), no un círculo pequeño
  const imagen = document.createElement("img");
  imagen.className = "card-imagen";
  imagen.src = animal.imagen;
  imagen.alt = animal.nombre;
  // Algunas fotos tienen la cara del animal descentrada; posicionImagen
  // es opcional (solo la tienen los animales que lo necesitan) y mueve
  // el punto de recorte de object-fit: cover hacia esa cara
  imagen.style.objectPosition = animal.posicionImagen || "center";
  card.appendChild(imagen);

  // Viñeta: capa oscura encima de la imagen para que el texto se lea
  // (puramente decorativa, no tiene contenido, solo CSS)
  const vinieta = document.createElement("div");
  vinieta.className = "card-vinieta";
  card.appendChild(vinieta);

  // Contenido: todo el texto va aquí, flotando sobre la imagen y la
  // viñeta, pegado a la parte de abajo de la tarjeta
  const contenido = document.createElement("div");
  contenido.className = "card-contenido";
  card.appendChild(contenido);

  // Nombre (el "listón" de la carta)
  const nombre = document.createElement("h1");
  nombre.className = "card-nombre";
  nombre.textContent = animal.nombre;
  contenido.appendChild(nombre);

  // Descripción: no viene lista en el objeto, se arma con
  // alimentacion + habitat
  const descripcion = document.createElement("p");
  descripcion.className = "card-descripcion";
  descripcion.textContent = `${animal.alimentacion} que vive en ${animal.habitat}.`;
  contenido.appendChild(descripcion);

  // Habilidades: es un arreglo dentro del objeto, así que se recorre con
  // forEach y se crea un <li> por cada habilidad
  const habilidades = document.createElement("ul");
  habilidades.className = "card-habilidades";
  animal.habilidades.forEach((habilidad) => {
    const li = document.createElement("li");
    li.textContent = habilidad;
    habilidades.appendChild(li);
  });
  contenido.appendChild(habilidades);

  // Stats: un <span> por cada dato suelto del objeto
  const stats = document.createElement("div");
  stats.className = "card-stats";

  const pesoKg = document.createElement("span");
  pesoKg.textContent = `Peso: ${animal.pesoKg} kg`;
  stats.appendChild(pesoKg);

  const habitat = document.createElement("span");
  habitat.textContent = `Hábitat: ${animal.habitat}`;
  stats.appendChild(habitat);

  const alimentacion = document.createElement("span");
  alimentacion.textContent = `Alimentación: ${animal.alimentacion}`;
  stats.appendChild(alimentacion);

  const peligroso = document.createElement("span");
  peligroso.textContent = `Peligroso: ${animal.peligroso ? "sí" : "no"}`;
  stats.appendChild(peligroso);

  contenido.appendChild(stats);

  // Al hacer click en la tarjeta, se abre el modal con la info de ESTE
  // animal. Como "animal" viene del parámetro de la función, cada tarjeta
  // "recuerda" a cuál animal pertenece (closure).
  card.addEventListener("click", () => {
    mostrarModal(animal);
  });

  // La función devuelve el elemento ya armado, pero todavía no está
  // en la página — falta agregarlo al DOM (eso pasa en renderizarObjetos())
  return card;
}

// El mouse tiene que quedarse quieto sobre una tarjeta este rato antes
// de que se active (en vez de saltar apenas la toca). Así el movimiento
// es más controlado: un paso a la vez, y no una cadena de saltos si el
// mouse pasa rápido sobre varias tarjetas seguidas
const RETRASO_HOVER_MS = 180;
let temporizadorHover = null;

const galeria = document.getElementById("galeria");

// Los .carrusel-item pintados ahora mismo. Es "let" (antes era const)
// porque renderizarObjetos() lo reemplaza cada vez que se llama, y lo
// leen actualizarCarrusel() e irATarjeta() más abajo.
let itemsCarrusel = [];

// Índice de la tarjeta activa del carrusel (ver actualizarCarrusel()).
// Se declara AQUÍ, antes de renderizarObjetos(animales): si se declarara
// más abajo, usarla antes de su línea daría "ReferenceError: Cannot
// access 'indiceActivo' before initialization" (temporal dead zone de let).
let indiceActivo = 0;

// Recibe un arreglo de objetos y lo pinta en <section id="galeria">:
// por cada objeto pide una tarjeta a crearCarta() y la envuelve en un
// .carrusel-item — ese wrapper es el que mueve/gira/achica
// actualizarCarrusel() más abajo; la tarjeta en sí (con su hover y su
// click) no se toca para nada.
// Primero vacía la galería, así se puede llamar más de una vez (por
// ejemplo con una lista filtrada) sin duplicar tarjetas.
function renderizarObjetos(listaObjetos) {
  galeria.innerHTML = "";

  itemsCarrusel = listaObjetos.map((objeto, indice) => {
    const item = document.createElement("div");
    item.className = "carrusel-item";
    item.appendChild(crearCarta(objeto));
    galeria.appendChild(item);

    // Pasar el mouse por encima de una tarjeta de los lados la vuelve la
    // activa (no reemplaza el .card:hover que ya existe, es un listener
    // aparte en JS: ese solo agranda/ilumina, este mueve el carrusel)
    item.addEventListener("mouseenter", () => {
      clearTimeout(temporizadorHover);
      temporizadorHover = setTimeout(() => irATarjeta(indice), RETRASO_HOVER_MS);
    });

    // Si el mouse se va antes de que se cumpla el retraso, se cancela:
    // solo pasa de tarjeta si de verdad se quedó ahí un momento
    item.addEventListener("mouseleave", () => {
      clearTimeout(temporizadorHover);
    });

    return item;
  });

  // La lista nueva puede ser más corta que la anterior: se vuelve a la
  // primera tarjeta para que indiceActivo no apunte a una que ya no existe
  indiceActivo = 0;
  actualizarCarrusel();
}

// Estado de los dos filtros (hábitat + peso máximo). Viven juntos acá
// arriba porque aplicarFiltros() los combina con AND: un animal se ve
// solo si cumple los dos a la vez, no si cumple cualquiera de los dos.
let habitatActivo = "Todos";
let pesoMaximo = Infinity;

// Combina el filtro de hábitat con el de peso y vuelve a pintar el
// carrusel. La llaman tanto el click de un botón de hábitat como el
// "input" del slider de peso, para que ninguno de los dos filtros pise
// al otro (sin esto, elegir un hábitat resetearía el peso, o viceversa).
function aplicarFiltros() {
  const lista = animales.filter((animal) => {
    const coincideHabitat = habitatActivo === "Todos" || animal.habitat === habitatActivo;
    const coincidePeso = animal.pesoKg <= pesoMaximo;
    return coincideHabitat && coincidePeso;
  });
  renderizarObjetos(lista);
}

// Filtro por hábitat: menú desplegable con "Todos" + una opción por cada
// hábitat distinto. Los hábitats NO se escriben a mano: se sacan de los
// datos, así si en gestion.html se crea un animal con un hábitat nuevo,
// su opción aparece sola.
const selectHabitat = document.getElementById("filtro-habitat");

function renderizarFiltroHabitat() {
  selectHabitat.innerHTML = "";

  // map() da un hábitat por animal, con repetidos ("Sabana" 4 veces).
  // Un Set solo guarda valores únicos, y [...set] lo vuelve a arreglo.
  const habitats = [...new Set(animales.map((animal) => animal.habitat))];

  // "Todos" va primero y no filtra nada (lista completa)
  ["Todos", ...habitats].forEach((habitat) => {
    const opcion = document.createElement("option");
    opcion.value = habitat;
    opcion.textContent = habitat;
    selectHabitat.appendChild(opcion);
  });

  selectHabitat.value = habitatActivo;
}

selectHabitat.addEventListener("change", () => {
  habitatActivo = selectHabitat.value;
  aplicarFiltros();
});

renderizarFiltroHabitat();

// Slider vertical flotante: filtra por peso máximo. El rango (min/max) se
// calcula de los animales actuales, no queda fijo en el HTML, así sigue
// siendo correcto si se agrega un animal más liviano o más pesado que los
// que había (ej. desde gestion.html).
const sliderPeso = document.getElementById("slider-peso");
const filtroPesoValor = document.getElementById("filtro-peso-valor");

function configurarFiltroPeso() {
  const pesos = animales.map((animal) => animal.pesoKg);
  const pesoMinimo = Math.min(...pesos);
  const pesoMaximoDatos = Math.max(...pesos);

  sliderPeso.min = pesoMinimo;
  sliderPeso.max = pesoMaximoDatos;
  // Arranca en el máximo: sin filtrar nada, se ven los animales completos
  sliderPeso.value = pesoMaximoDatos;
  pesoMaximo = pesoMaximoDatos;
  filtroPesoValor.textContent = `Hasta ${pesoMaximoDatos} kg`;

  // "input" dispara en cada movimiento del thumb (arrastrando o con las
  // flechas del teclado); "change" solo dispararía al soltar el mouse
  sliderPeso.addEventListener("input", () => {
    pesoMaximo = Number(sliderPeso.value);
    filtroPesoValor.textContent = `Hasta ${pesoMaximo} kg`;
    aplicarFiltros();
  });
}

configurarFiltroPeso();
aplicarFiltros();

// Vuelve el hábitat a "Todos" y el slider a su máximo (sin filtrar nada).
// No repite la lógica del rango: solo lee sliderPeso.max, que ya calculó
// configurarFiltroPeso() antes.
const btnRestablecerFiltros = document.getElementById("btn-restablecer-filtros");

function restablecerFiltros() {
  habitatActivo = "Todos";
  selectHabitat.value = "Todos";

  pesoMaximo = Number(sliderPeso.max);
  sliderPeso.value = sliderPeso.max;
  filtroPesoValor.textContent = `Hasta ${pesoMaximo} kg`;

  aplicarFiltros();
}

btnRestablecerFiltros.addEventListener("click", restablecerFiltros);

// Referencias del modal de detalle
const modalOverlay = document.getElementById("modal-overlay");
const modalCerrar = document.getElementById("modal-cerrar");

// Llena el modal con los datos de UN animal y lo muestra quitando "hidden"
function mostrarModal(animal) {
  document.getElementById("modal-imagen").src = animal.imagen;
  document.getElementById("modal-imagen").alt = animal.nombre;
  document.getElementById("modal-imagen").style.objectPosition = animal.posicionImagen || "center";
  document.getElementById("modal-nombre").textContent = animal.nombre;
  // A diferencia de la tarjeta (que arma una frase corta con
  // alimentacion + habitat), el modal muestra la descripción real
  document.getElementById("modal-descripcion").textContent = animal.descripcion;

  const listaHabilidades = document.getElementById("modal-habilidades");
  listaHabilidades.innerHTML = ""; // limpia habilidades del animal anterior
  animal.habilidades.forEach((habilidad) => {
    const li = document.createElement("li");
    li.textContent = habilidad;
    listaHabilidades.appendChild(li);
  });

  // Datos sueltos del animal: cada uno va en el <span> que ya existe en
  // el HTML (no se crean elementos nuevos, a diferencia de habilidades)
  document.getElementById("modal-pesoKg").textContent = `Peso: ${animal.pesoKg} kg`;
  document.getElementById("modal-habitat").textContent = `Hábitat: ${animal.habitat}`;
  document.getElementById("modal-alimentacion").textContent = `Alimentación: ${animal.alimentacion}`;
  document.getElementById("modal-peligroso").textContent = `Peligroso: ${animal.peligroso ? "sí" : "no"}`;

  modalOverlay.hidden = false;
}

// Vuelve a poner "hidden": el navegador se encarga de ocultarlo (CSS)
function cerrarModal() {
  modalOverlay.hidden = true;
}

// Cierra con el botón ✕
modalCerrar.addEventListener("click", cerrarModal);

// Cierra al hacer click en el fondo oscuro, pero no si el click fue
// dentro de la caja del modal (por eso se compara con e.target)
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    cerrarModal();
  }
});

// Carrusel tipo "coverflow" en loop: solo UNA tarjeta está activa (grande,
// de frente) y el resto se acomoda a los lados, más chica, girada en 3D y
// más transparente mientras más lejos esté de la activa. No toca nada
// de .card (hover, click, sombra) — solo mueve el .carrusel-item que la
// envuelve, con transform: translateX + rotateY + scale.
// (indiceActivo se declara más arriba, junto a renderizarObjetos())

// Distancia "más corta" entre dos posiciones en un arreglo circular.
// Ejemplo con 10 animales: entre el Pingüino (índice 9) y el León
// (índice 0) la resta normal da -9, pero dando la vuelta por el otro
// lado son solo 1 de distancia — por eso el León queda pegado al lado
// del Pingüino en vez de escondido al otro extremo del carrusel.
function distanciaCircular(indice, activo, total) {
  let distancia = indice - activo;
  if (distancia > total / 2) distancia -= total;
  if (distancia < -total / 2) distancia += total;
  return distancia;
}

// Ajustes según el modo de pantalla — mismos cortes (768px, 1024px) que
// usa actualizarModo(): más grande y más separado mientras más pantalla hay
function configCarrusel() {
  if (window.innerWidth >= 1024) {
    return { anchoActiva: 340, separacion: 210, angulo: 35 };
  }
  if (window.innerWidth >= 768) {
    return { anchoActiva: 270, separacion: 160, angulo: 32 };
  }
  return { anchoActiva: 210, separacion: 115, angulo: 28 };
}

function actualizarCarrusel() {
  const cfg = configCarrusel();
  galeria.style.width = `${cfg.anchoActiva}px`;

  itemsCarrusel.forEach((item, indice) => {
    // Distancia circular (con signo) entre esta tarjeta y la activa:
    // 0 = activa, negativo = a la izquierda, positivo = a la derecha
    const distancia = distanciaCircular(indice, indiceActivo, itemsCarrusel.length);
    const distanciaAbs = Math.abs(distancia);

    if (distanciaAbs > 2) {
      // Más de 2 tarjetas lejos de la activa: se esconde del todo
      item.style.opacity = "0";
      item.style.pointerEvents = "none";
      item.style.zIndex = "0";
      return;
    }

    const escala = distancia === 0 ? 1 : 1 - distanciaAbs * 0.18;
    const angulo = distancia === 0 ? 0 : cfg.angulo * -Math.sign(distancia);
    const opacidad = distancia === 0 ? 1 : 1 - distanciaAbs * 0.35;

    item.style.transform =
      `translateX(${distancia * cfg.separacion}px) rotateY(${angulo}deg) scale(${escala})`;
    item.style.opacity = String(opacidad);
    item.style.zIndex = String(10 - distanciaAbs);
    // Todas las visibles reciben el mouse (así el mouseenter de arriba
    // puede activarlas); como el mouseenter siempre ocurre antes que el
    // click, al hacer click ya se volvió la activa — nunca se "selecciona"
    // directamente una tarjeta que seguía a un lado
    item.style.pointerEvents = "auto";
  });
}

function irATarjeta(nuevoIndice) {
  const total = itemsCarrusel.length;
  // Sin tarjetas no hay a dónde ir (y x % 0 da NaN)
  if (total === 0) return;
  // % en JS puede devolver negativo (ej. -1 % 10 === -1), por eso se
  // suma "total" antes de repetir el módulo: así, ir "antes" de la
  // primera tarjeta manda a la última, y viceversa (carrusel en loop)
  indiceActivo = ((nuevoIndice % total) + total) % total;
  actualizarCarrusel();
}

// Si cambia el ancho de la ventana, cambia configCarrusel() (tamaño y
// separación), así que hay que volver a acomodar las tarjetas
// (la primera acomodada ya la hizo renderizarObjetos(animales) arriba)
window.addEventListener("resize", actualizarCarrusel);

// Deslizar con el dedo en celular/tablet: el mouseenter de arriba no
// sirve en pantallas táctiles (no hay "pasar el mouse"), así que acá se
// mide cuánto se movió el dedo entre que tocó y que soltó la pantalla
const galeriaWrapper = document.querySelector(".galeria-wrapper");
const UMBRAL_DESLIZAR_PX = 60; // qué tan largo tiene que ser el gesto para que cuente
let inicioDeslizarX = 0;

galeriaWrapper.addEventListener("touchstart", (e) => {
  inicioDeslizarX = e.touches[0].clientX;
});

galeriaWrapper.addEventListener("touchend", (e) => {
  const finDeslizarX = e.changedTouches[0].clientX;
  const distancia = finDeslizarX - inicioDeslizarX;

  // Si el dedo casi no se movió, no cuenta como "deslizar" (evita que
  // un toque corto o tembloroso pase de tarjeta sin querer)
  if (Math.abs(distancia) < UMBRAL_DESLIZAR_PX) return;

  if (distancia < 0) {
    irATarjeta(indiceActivo + 1); // deslizó hacia la izquierda: siguiente
  } else {
    irATarjeta(indiceActivo - 1); // deslizó hacia la derecha: anterior
  }
});

// Muestra en qué modo de pantalla está el navegador ahora mismo, con los
// mismos cortes que usa el CSS para las columnas de la galería
const modoPantalla = document.getElementById("modo-pantalla");

function actualizarModo() {
  if (window.innerWidth >= 1024) {
    modoPantalla.textContent = "Modo: Escritorio";
  } else if (window.innerWidth >= 768) {
    modoPantalla.textContent = "Modo: Tablet";
  } else {
    modoPantalla.textContent = "Modo: Teléfono";
  }
}

window.addEventListener("resize", actualizarModo);
actualizarModo();

// Botón modo claro/oscuro: solo alterna una clase en <body>.
// El cambio de colores real vive en las variables CSS de styles.css,
// aquí solo se prende o apaga la clase que las sobreescribe.
const btnModo = document.getElementById("btn-modo");
btnModo.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const esClaro = document.body.classList.contains("light-mode");
  btnModo.textContent = esClaro ? "Modo oscuro" : "Modo claro";
});
