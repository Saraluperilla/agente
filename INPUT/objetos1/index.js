// Arreglo de objetos: cada objeto representa un animal con las mismas
// propiedades (nombre, imagen, descripcion, habitat, alimentacion, pesoKg,
// peligroso, habilidades). Esto permite recorrerlos todos igual con un
// forEach. "descripcion" es texto real sobre el animal (se usa en el
// modal); la tarjeta arma su propia frase corta con habitat+alimentacion.
let animales = [
  {
    nombre: "León",
    imagen: "https://content.nationalgeographic.com.es/medio/2024/08/09/leon-masai-mara-kenia-antonio_28569739_240809155946_800x800.jpg",
    descripcion: "El león es el único felino que vive en manada, llamada orgullo. Los machos se distinguen por su melena, y las hembras son las principales cazadoras del grupo.",
    habitat: "Sabana",
    alimentacion: "Carnívoro",
    pesoKg: 190,
    peligroso: true,
    habilidades: ["Cazar", "Correr", "Rugir"],
  },
  {
    nombre: "Elefante",
    imagen:"https://content.nationalgeographic.com.es/medio/2026/08/13/1-elefante_819f7e8a_260813151716_800x800.webp",
    descripcion: "El elefante es el mamífero terrestre más grande del mundo. Usa su trompa para comer, beber y comunicarse, y vive en manadas lideradas por una hembra matriarca.",
    habitat: "Sabana",
    alimentacion: "Herbívoro",
    pesoKg: 5500,
    peligroso: false,
    habilidades: ["Nadar", "Usar la trompa", "Cargar peso"],
  },
  {
    nombre: "Tigre",
    imagen:"https://content.nationalgeographic.com.es/medio/2024/04/12/tigre-sumatra-en-libertad_00000000_ef50936c_240412092732_800x800.jpg",
    descripcion: "El tigre es el felino más grande del mundo y un cazador solitario. Sus rayas son únicas en cada individuo, como una huella digital.",
    habitat: "Selva",
    alimentacion: "Carnívoro",
    pesoKg: 220,
    peligroso: true,
    habilidades: ["Cazar", "Nadar", "Trepar"],
  },
  {
    nombre: "Jirafa",
    imagen:"https://static.nationalgeographicla.com/files/styles/image_3200/public/01-giraffe-spots-nationalgeographic_2424106.webp?w=1600&h=1067&q=100",
    posicionImagen: "center 10%",
    descripcion: "La jirafa es el animal terrestre más alto del planeta gracias a su largo cuello, que también usa para pelear entre machos a cabezazos.",
    habitat: "Sabana",
    alimentacion: "Herbívoro",
    pesoKg: 1100,
    peligroso: false,
    habilidades: ["Correr", "Alcanzar árboles altos", "Patear"],
  },
  {
    nombre: "Delfín",
    imagen: "https://pymstatic.com/17949/conversions/inteligencia-de-delfines-wide.jpg",
    descripcion: "El delfín es uno de los animales más inteligentes del océano. Se comunica mediante silbidos y usa la ecolocalización para orientarse y cazar.",
    habitat: "Océano",
    alimentacion: "Carnívoro",
    pesoKg: 300,
    peligroso: false,
    habilidades: ["Nadar", "Saltar", "Comunicarse"],
  },
  {
    nombre: "Oso Polar",
    imagen:"https://assets.worldwildlife.org/www-prd/images/wwfcmsprodimagespolar.2e16d0ba.format-webp.fill-660x660.webp",
    descripcion: "El oso polar es el mayor depredador terrestre del Ártico. Su pelaje blanco lo camufla en la nieve, y una gruesa capa de grasa lo protege del frío extremo.",
    habitat: "Ártico",
    alimentacion: "Carnívoro",
    pesoKg: 450,
    peligroso: true,
    habilidades: ["Nadar", "Cazar", "Resistir el frío"],
  },
  {
    nombre: "Águila",
    imagen:"https://static.wikia.nocookie.net/ficcion-sin-limites/images/0/02/Aguila_2.0.jpg/revision/latest?cb=20220905183220&path-prefix=es",
    descripcion: "El águila tiene una de las vistas más agudas del reino animal, capaz de detectar una presa a varios kilómetros de distancia mientras vuela.",
    habitat: "Montañas",
    alimentacion: "Carnívoro",
    pesoKg: 25,
    peligroso: false,
    habilidades: ["Volar", "Cazar", "Ver a larga distancia"],
  },
  {
    nombre: "Cocodrilo",
    imagen:"https://content.nationalgeographic.com.es/medio/2024/07/16/shutterstock-603944903_c87c9e92_240716092841_800x800.jpg",
    posicionImagen: "25% 40%",
    descripcion: "El cocodrilo es un depredador que ha cambiado poco en millones de años. Puede permanecer casi inmóvil durante horas antes de atacar con gran velocidad.",
    habitat: "Ríos y pantanos",
    alimentacion: "Carnívoro",
    pesoKg: 500,
    peligroso: true,
    habilidades: ["Nadar", "Cazar", "Camuflarse"],
  },
  {
    nombre: "Cebra",
    imagen:"https://cdn0.ecologiaverde.com/es/posts/3/7/7/cebra_5773_orig.jpg",
    posicionImagen: "78% 20%",
    descripcion: "La cebra tiene un patrón de rayas único para cada individuo, que podría ayudar a confundir a los depredadores y a regular su temperatura corporal.",
    habitat: "Sabana",
    alimentacion: "Herbívoro",
    pesoKg: 350,
    peligroso: false,
    habilidades: ["Correr", "Patear", "Vivir en manada"],
  },
  {
    nombre: "Pingüino",
    imagen:"https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Pygoscelis_papua.jpg/250px-Pygoscelis_papua.jpg?utm_source=es.wikipedia.org&utm_campaign=parser&utm_content=thumbnail",
    posicionImagen: "center 15%",
    descripcion: "El pingüino no puede volar, pero es un excelente nadador. Vive en grandes colonias, y ambos padres se turnan para cuidar el huevo.",
    habitat: "Antártida",
    alimentacion: "Carnívoro",
    pesoKg: 35,
    peligroso: false,
    habilidades: ["Nadar", "Bucear", "Resistir el frío"],
  },
];

// Pruebas rápidas en consola para confirmar que el arreglo quedó bien
console.log(animales.length); // debe dar 10
console.log(animales[0].nombre); // "León"

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
  // en la página — falta agregarlo al DOM (eso pasa en el forEach de abajo)
  return card;
}

// Recorre el arreglo "animales" y, por cada uno, pide una tarjeta a
// crearCarta() y la mete dentro de <section id="galeria"> del HTML.
// Cada tarjeta va envuelta en un .carrusel-item: ese wrapper es el que
// mueve/gira/achica actualizarCarrusel() más abajo — la tarjeta en sí
// (con su hover y su click) no se toca para nada.
// El mouse tiene que quedarse quieto sobre una tarjeta este rato antes
// de que se active (en vez de saltar apenas la toca). Así el movimiento
// es más controlado: un paso a la vez, y no una cadena de saltos si el
// mouse pasa rápido sobre varias tarjetas seguidas
const RETRASO_HOVER_MS = 180;
let temporizadorHover = null;

const galeria = document.getElementById("galeria");
const itemsCarrusel = animales.map((animal, indice) => {
  const item = document.createElement("div");
  item.className = "carrusel-item";
  item.appendChild(crearCarta(animal));
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
let indiceActivo = 0;

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
  // % en JS puede devolver negativo (ej. -1 % 10 === -1), por eso se
  // suma "total" antes de repetir el módulo: así, ir "antes" de la
  // primera tarjeta manda a la última, y viceversa (carrusel en loop)
  indiceActivo = ((nuevoIndice % total) + total) % total;
  actualizarCarrusel();
}

// Si cambia el ancho de la ventana, cambia configCarrusel() (tamaño y
// separación), así que hay que volver a acomodar las tarjetas
window.addEventListener("resize", actualizarCarrusel);
actualizarCarrusel();

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
