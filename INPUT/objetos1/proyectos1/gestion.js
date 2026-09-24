// El arreglo "animales" viene de data.js (se carga antes que este script
// en gestion.html), igual que en index.js.

const tablaBody = document.getElementById("tabla-animales-body");

// Separada en una función (en vez de un forEach suelto) para poder
// volver a llamarla después de agregar un animal nuevo y que la tabla
// de "Mostrar todos" se actualice sin recargar la página.
function renderizarTabla() {
  tablaBody.innerHTML = "";

  animales.forEach((animal) => {
    const fila = document.createElement("tr");

    const nombre = document.createElement("td");
    nombre.textContent = animal.nombre;
    fila.appendChild(nombre);

    const habitat = document.createElement("td");
    habitat.textContent = animal.habitat;
    fila.appendChild(habitat);

    const alimentacion = document.createElement("td");
    alimentacion.textContent = animal.alimentacion;
    fila.appendChild(alimentacion);

    const pesoKg = document.createElement("td");
    pesoKg.textContent = animal.pesoKg;
    fila.appendChild(pesoKg);

    const peligroso = document.createElement("td");
    peligroso.textContent = animal.peligroso ? "Sí" : "No";
    fila.appendChild(peligroso);

    tablaBody.appendChild(fila);
  });
}

renderizarTabla();

// Navegación del sidebar: cada botón tiene data-seccion="crear" y existe
// una <section id="seccion-crear">; mostrarSeccion() oculta las demás y
// resalta el botón que corresponde a la que queda visible.
const botonesSidebar = document.querySelectorAll(".sidebar-item");

function mostrarSeccion(nombreSeccion) {
  document.querySelectorAll(".seccion").forEach((seccion) => {
    seccion.hidden = seccion.id !== `seccion-${nombreSeccion}`;
  });

  botonesSidebar.forEach((boton) => {
    boton.classList.toggle("activo", boton.dataset.seccion === nombreSeccion);
  });
}

botonesSidebar.forEach((boton) => {
  boton.addEventListener("click", () => mostrarSeccion(boton.dataset.seccion));
});

// Formulario de "Crear": arma un objeto animal con las mismas propiedades
// que los de data.js (ver la forma del arreglo "animales" ahí) y lo agrega.
const formCrear = document.getElementById("form-crear");

formCrear.addEventListener("submit", (e) => {
  // Evita que el formulario recargue la página (comportamiento por
  // defecto de submit), así el arreglo "animales" en memoria no se pierde
  e.preventDefault();

  const datos = new FormData(formCrear);

  const nuevoAnimal = {
    nombre: datos.get("nombre"),
    imagen: datos.get("imagen"),
    descripcion: datos.get("descripcion"),
    habitat: datos.get("habitat"),
    alimentacion: datos.get("alimentacion"),
    pesoKg: Number(datos.get("pesoKg")),
    peligroso: datos.get("peligroso") === "on",
    // El input es un texto separado por comas ("Nadar, Cazar"); se separa
    // por "," y se recorta cada trozo con trim() para quitar espacios de
    // sobra, igual que necesita habilidades.forEach() en index.js
    habilidades: datos
      .get("habilidades")
      .split(",")
      .map((habilidad) => habilidad.trim())
      .filter((habilidad) => habilidad !== ""),
  };

  // posicionImagen es opcional: solo se agrega la propiedad si el
  // usuario escribió algo (igual que en los animales de data.js, donde
  // no todos la tienen)
  const posicionImagen = datos.get("posicionImagen").trim();
  if (posicionImagen !== "") {
    nuevoAnimal.posicionImagen = posicionImagen;
  }

  animales.push(nuevoAnimal);
  // Sin esto, el animal nuevo solo viviría en la memoria de esta pestaña
  // (ver data.js): al guardarlo en localStorage, index.html lo puede leer
  // la próxima vez que se abra o se recargue.
  localStorage.setItem("animales", JSON.stringify(animales));
  renderizarTabla();

  formCrear.reset();
  mostrarSeccion("mostrar-todos");
});
