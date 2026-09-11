// Arreglo de objetos: cada objeto representa un héroe con las mismas
// propiedades (nombre, años, imagen, poderes, etc.). Esto permite
// recorrerlos todos igual con un solo forEach más abajo.
let heroes = [
  {
    nombre: "Iron Man",
    años: 45,
    imagen: "https://i.blogs.es/0f256b/iron-man/450_1000.jpg",
    poderes: ["Tener mucha plata", "Ser muy inteligente y visionario"],
    altura: 1.80,
    descripcion: "Tony Stark es un filántropo, millonario de la clase exclusiva de New York.",
    bando: "heroe",
    universo: "Marvel",
    nivelDeFuerza: 96,
    activo: true,
  },
  {
    nombre: "Spider-Man",
    años: 18,
    imagen: "https://i.pinimg.com/736x/18/d2/4e/18d24e461fc587c760c733d03b6b492f.jpg",
    poderes: ["Trepar paredes", "Sentido arácnido"],
    altura: 1.75,
    descripcion: "Peter Parker es un joven estudiante que combate el crimen en Nueva York.",
    bando: "heroe",
    universo: "Marvel",
    nivelDeFuerza: 80,
    activo: true,
  },
  {
    nombre: "Thor",
    años: 1500,
    imagen: "https://media.gq.com.mx/photos/5f43fe8d4771415bd656820c/1:1/w_1687,h_1687,c_limit/peliculas%20de%20marvel%20thor%20ragnarok.jpg",
    poderes: ["Control del rayo", "Fuerza asgardiana"],
    altura: 1.95,
    descripcion: "Dios del trueno y heredero al trono de Asgard.",
    bando: "heroe",
    universo: "Marvel",
    nivelDeFuerza: 99,
    activo: true,
  },
  {
    nombre: "Black Widow",
    años: 39,
    imagen: "https://media.revistagq.com/photos/605b069e5b7d28b52d842eba/1:1/w_800,h_800,c_limit/black-widow-estreno.jpeg",
    poderes: ["Combate cuerpo a cuerpo", "Espionaje"],
    altura: 1.70,
    descripcion: "Natasha Romanoff, ex espía rusa convertida en agente de S.H.I.E.L.D.",
    bando: "heroe",
    universo: "Marvel",
    nivelDeFuerza: 72,
    activo: false,
  },
  {
    nombre: "Batman",
    años: 40,
    imagen: "https://media.revistagq.com/photos/62206872e90a38b0c1d2f3e9/16:9/w_1280,c_limit/fotonoticia_20201121195132_1200.jpg",
    poderes: ["Estrategia e inteligencia", "Artes marciales"],
    altura: 1.88,
    descripcion: "Bruce Wayne protege Ciudad Gótica sin poderes sobrehumanos, solo tecnología y disciplina.",
    bando: "heroe",
    universo: "DC",
    nivelDeFuerza: 85,
    activo: true,
  },
  {
    nombre: "Superman",
    años: 35,
    imagen: "https://media.gq.com.mx/photos/6046677d32fb42c17c0c6fe7/4:3/w_2664,h_1998,c_limit/SUPERMAN.jpg",
    poderes: ["Vuelo", "Fuerza sobrehumana"],
    altura: 1.91,
    descripcion: "Clark Kent, un kryptoniano criado en la Tierra que protege a la humanidad.",
    bando: "heroe",
    universo: "DC",
    nivelDeFuerza: 100,
    activo: true,
  },
  {
    nombre: "Wonder Woman",
    años: 3000,
    imagen: "https://media.vandalsports.com/master/8-2026/2026830113549_1.jpg",
    poderes: ["Fuerza amazónica", "Lazo de la verdad"],
    altura: 1.83,
    descripcion: "Diana Prince, princesa amazona y guerrera incansable.",
    bando: "heroe",
    universo: "DC",
    nivelDeFuerza: 97,
    activo: true,
  },
  {
    nombre: "Flash",
    años: 28,
    imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcGdK241MxY2Iknd_g4dZlgRRzK1tSppi3R931ZEArlg&s=10",
    poderes: ["Súper velocidad", "Acceso a la Fuerza de Velocidad"],
    altura: 1.83,
    descripcion: "Barry Allen, el hombre más rápido con vida.",
    bando: "heroe",
    universo: "DC",
    nivelDeFuerza: 88,
    activo: true,
  },
  {
    nombre: "Hulk",
    años: 47,
    imagen: "https://i.pinimg.com/736x/80/bd/b6/80bdb6e8c91535f1a43dddc36db604ac.jpg",
    poderes: ["Fuerza descomunal", "Regeneración"],
    altura: 2.44,
    descripcion: "Bruce Banner se transforma en una fuerza de la naturaleza cuando se enoja.",
    bando: "heroe",
    universo: "Marvel",
    nivelDeFuerza: 98,
    activo: true,
  },
  {
    nombre: "Captain America",
    años: 105,
    imagen: "https://placehold.co/300x300/470000/f5f5f5?text=Cap+America",
    poderes: ["Fuerza y resistencia mejoradas", "Liderazgo táctico"],
    altura: 1.88,
    descripcion: "Steve Rogers, soldado súper humano y símbolo de la Segunda Guerra Mundial.",
    bando: "heroe",
    universo: "Marvel",
    nivelDeFuerza: 82,
    activo: false,
  },
  {
    nombre: "Aquaman",
    años: 34,
    imagen: "https://placehold.co/300x300/470000/f5f5f5?text=Aquaman",
    poderes: ["Control de criaturas marinas", "Resistencia bajo el agua"],
    altura: 1.85,
    descripcion: "Arthur Curry, rey de Atlantis y protector de los océanos.",
    bando: "heroe",
    universo: "DC",
    nivelDeFuerza: 90,
    activo: true,
  },
  {
    nombre: "Black Panther",
    años: 32,
    imagen: "https://placehold.co/300x300/470000/f5f5f5?text=Black+Panther",
    poderes: ["Fuerza mejorada por vibranium", "Sigilo felino"],
    altura: 1.83,
    descripcion: "T'Challa, rey de Wakanda y protector de su pueblo.",
    bando: "heroe",
    universo: "Marvel",
    nivelDeFuerza: 89,
    activo: true,
  },
];

// Pruebas rápidas en consola para confirmar que el arreglo quedó bien
console.log(heroes.length); // debe dar 12
console.log(heroes[0].nombre); // "Iron Man"

// Recibe UN objeto héroe y devuelve el <div class="card"> ya armado,
// con una etiqueta HTML separada por cada propiedad (no un solo bloque
// de texto). Como no usa id, esta misma función sirve para las 12 tarjetas.
function crearCarta(heroe) {
  const card = document.createElement("div");
  card.className = "card";

  // Imagen del héroe
  const imagen = document.createElement("img");
  imagen.className = "card-imagen";
  imagen.src = heroe.imagen;
  imagen.alt = heroe.nombre;
  card.appendChild(imagen);

  // Nombre
  const nombre = document.createElement("h1");
  nombre.className = "card-nombre";
  nombre.textContent = heroe.nombre;
  card.appendChild(nombre);

  // Descripción
  const descripcion = document.createElement("p");
  descripcion.className = "card-descripcion";
  descripcion.textContent = heroe.descripcion;
  card.appendChild(descripcion);

  // Poderes: es un arreglo dentro del objeto, así que se recorre con
  // forEach y se crea un <li> por cada poder
  const poderes = document.createElement("ul");
  poderes.className = "card-poderes";
  heroe.poderes.forEach((poder) => {
    const li = document.createElement("li");
    li.textContent = poder;
    poderes.appendChild(li);
  });
  card.appendChild(poderes);

  // Stats: un <span> por cada dato suelto del objeto (edad, altura, etc.)
  const stats = document.createElement("div");
  stats.className = "card-stats";

  const edad = document.createElement("span");
  edad.textContent = `Edad: ${heroe.años}`;
  stats.appendChild(edad);

  const altura = document.createElement("span");
  altura.textContent = `Altura: ${heroe.altura} m`;
  stats.appendChild(altura);

  const universo = document.createElement("span");
  universo.textContent = `Universo: ${heroe.universo}`;
  stats.appendChild(universo);

  const bando = document.createElement("span");
  bando.textContent = `Bando: ${heroe.bando}`;
  stats.appendChild(bando);

  const nivelDeFuerza = document.createElement("span");
  nivelDeFuerza.textContent = `Nivel de fuerza: ${heroe.nivelDeFuerza}`;
  stats.appendChild(nivelDeFuerza);

  card.appendChild(stats);

  // Al hacer click en la tarjeta, se abre el modal con la info de ESTE
  // héroe. Como "heroe" viene del parámetro de la función, cada tarjeta
  // "recuerda" a cuál héroe pertenece (closure).
  card.addEventListener("click", () => {
    mostrarModal(heroe);
  });

  // La función devuelve el elemento ya armado, pero todavía no está
  // en la página — falta agregarlo al DOM (eso pasa en el forEach de abajo)
  return card;
}

// Recorre el arreglo "heroes" y, por cada uno, pide una tarjeta a
// crearCarta() y la mete dentro de <section id="galeria"> del HTML
const galeria = document.getElementById("galeria");
heroes.forEach((heroe) => {
  galeria.appendChild(crearCarta(heroe));
});

// Referencias del modal de detalle
const modalOverlay = document.getElementById("modal-overlay");
const modalCerrar = document.getElementById("modal-cerrar");

// Llena el modal con los datos de UN héroe y lo muestra quitando "hidden"
function mostrarModal(heroe) {
  document.getElementById("modal-imagen").src = heroe.imagen;
  document.getElementById("modal-imagen").alt = heroe.nombre;
  document.getElementById("modal-nombre").textContent = heroe.nombre;
  document.getElementById("modal-descripcion").textContent = heroe.descripcion;

  const listaPoderes = document.getElementById("modal-poderes");
  listaPoderes.innerHTML = ""; // limpia poderes del héroe anterior
  heroe.poderes.forEach((poder) => {
    const li = document.createElement("li");
    li.textContent = poder;
    listaPoderes.appendChild(li);
  });

  document.getElementById("modal-edad").textContent = `Edad: ${heroe.años}`;
  document.getElementById("modal-altura").textContent = `Altura: ${heroe.altura} m`;
  document.getElementById("modal-universo").textContent = `Universo: ${heroe.universo}`;
  document.getElementById("modal-bando").textContent = `Bando: ${heroe.bando}`;
  document.getElementById("modal-nivelDeFuerza").textContent = `Nivel de fuerza: ${heroe.nivelDeFuerza}`;
  document.getElementById("modal-activo").textContent = `Activo: ${heroe.activo ? "sí" : "no"}`;

  modalOverlay.hidden = false;
}

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

// Botón modo claro/oscuro: solo alterna una clase en <body>.
// El cambio de colores real vive en las variables CSS de styles.css,
// aquí solo se prende o apaga la clase que las sobreescribe.
const btnModo = document.getElementById("btn-modo");
btnModo.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  const esClaro = document.body.classList.contains("light-mode");
  btnModo.textContent = esClaro ? "Modo oscuro" : "Modo claro";
});
