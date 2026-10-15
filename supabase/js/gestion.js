// 4° script: lógica de la página. Usa las funciones de datos.js y actualiza el DOM.

const form = document.getElementById("form-animal");
const formTitulo = document.getElementById("form-titulo");
const btnCancelar = document.getElementById("btn-cancelar");
const filtroHabitat = document.getElementById("filtro-habitat");
const contenedor = document.getElementById("lista-animales");
const mensaje = document.getElementById("mensaje");

let animalesActuales = [];

const mostrarMensaje = (texto, esError = false) => {
  mensaje.textContent = texto;
  mensaje.className = esError ? "mensaje error" : "mensaje";
};

// ---------- Render ----------

const crearCard = (animal) => {
  const card = document.createElement("article");
  card.className = "card";
  card.innerHTML = `
    <img src="${animal.imagen || ""}" alt="${animal.nombre}">
    <h3>${animal.nombre}</h3>
    <p>${animal.descripcion || ""}</p>
    <ul>
      <li><strong>Hábitat:</strong> ${animal.habitat}</li>
      <li><strong>Alimentación:</strong> ${animal.alimentacion || "-"}</li>
      <li><strong>Peso:</strong> ${animal.peso_kg ?? "-"} kg</li>
      <li><strong>Peligroso:</strong> ${animal.peligroso ? "Sí" : "No"}</li>
      <li><strong>Habilidades:</strong> ${(animal.habilidades || []).join(", ")}</li>
    </ul>
    <div class="acciones">
      <button data-accion="editar" data-id="${animal.id}">Editar</button>
      <button data-accion="eliminar" data-id="${animal.id}">Eliminar</button>
    </div>
  `;
  return card;
};

const pintarAnimales = (animales) => {
  contenedor.innerHTML = "";
  if (animales.length === 0) {
    contenedor.textContent = "No hay animales para mostrar.";
    return;
  }
  animales.forEach((animal) => contenedor.appendChild(crearCard(animal)));
};

const llenarFiltro = (animales) => {
  const seleccionado = filtroHabitat.value;
  const habitats = [...new Set(animales.map((a) => a.habitat))].sort();
  filtroHabitat.innerHTML = `<option value="">Todos</option>`;
  habitats.forEach((h) => {
    filtroHabitat.innerHTML += `<option value="${h}">${h}</option>`;
  });
  filtroHabitat.value = seleccionado;
};

// ---------- Carga ----------

const cargarAnimales = async () => {
  try {
    mostrarMensaje("Cargando...");
    const todos = await leerAnimales();
    llenarFiltro(todos);
    animalesActuales = filtroHabitat.value
      ? await filtrarPorHabitat(filtroHabitat.value)
      : todos;
    pintarAnimales(animalesActuales);
    mostrarMensaje("");
  } catch (error) {
    mostrarMensaje(`Error al cargar: ${error.message}`, true);
  }
};

// ---------- Formulario (crear / editar) ----------

const leerFormulario = () => ({
  nombre: form.nombre.value.trim(),
  imagen: form.imagen.value.trim(),
  descripcion: form.descripcion.value.trim(),
  habitat: form.habitat.value.trim(),
  alimentacion: form.alimentacion.value,
  peso_kg: form.peso_kg.value === "" ? null : Number(form.peso_kg.value),
  peligroso: form.peligroso.checked,
  habilidades: form.habilidades.value
    .split(",")
    .map((h) => h.trim())
    .filter((h) => h !== ""),
});

const limpiarFormulario = () => {
  form.reset();
  // El input se llama animal_id y no id: form.id devuelve el atributo id del <form>.
  form.animal_id.value = "";
  formTitulo.textContent = "Agregar animal";
  btnCancelar.hidden = true;
};

const cargarEnFormulario = (animal) => {
  form.animal_id.value = animal.id;
  form.nombre.value = animal.nombre;
  form.imagen.value = animal.imagen || "";
  form.descripcion.value = animal.descripcion || "";
  form.habitat.value = animal.habitat;
  form.alimentacion.value = animal.alimentacion || "";
  form.peso_kg.value = animal.peso_kg ?? "";
  form.peligroso.checked = animal.peligroso;
  form.habilidades.value = (animal.habilidades || []).join(", ");
  formTitulo.textContent = `Editando: ${animal.nombre}`;
  btnCancelar.hidden = false;
  form.scrollIntoView({ behavior: "smooth" });
};

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();
  const animal = leerFormulario();
  const id = form.animal_id.value;
  try {
    if (id) {
      await actualizarAnimal(Number(id), animal);
      mostrarMensaje(`${animal.nombre} actualizado.`);
    } else {
      await crearAnimal(animal);
      mostrarMensaje(`${animal.nombre} agregado.`);
    }
    limpiarFormulario();
    await cargarAnimales();
  } catch (error) {
    mostrarMensaje(`Error al guardar: ${error.message}`, true);
  }
});

btnCancelar.addEventListener("click", limpiarFormulario);

// ---------- Botones de cada card ----------
// Un solo listener en el contenedor (delegación de eventos):
// sirve también para las cards que se crean después.
contenedor.addEventListener("click", async (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const id = Number(boton.dataset.id);
  const animal = animalesActuales.find((a) => a.id === id);

  if (boton.dataset.accion === "editar") {
    cargarEnFormulario(animal);
  }

  if (boton.dataset.accion === "eliminar") {
    if (boton.dataset.confirmar !== "si") {
      // Primer clic: pide confirmación en el mismo botón.
      boton.dataset.confirmar = "si";
      boton.textContent = "¿Seguro?";
      return;
    }
    try {
      await eliminarAnimal(id);
      mostrarMensaje(`${animal.nombre} eliminado.`);
      await cargarAnimales();
    } catch (error) {
      mostrarMensaje(`Error al eliminar: ${error.message}`, true);
    }
  }
});

// ---------- Filtro ----------

filtroHabitat.addEventListener("change", cargarAnimales);

// ---------- Inicio ----------

cargarAnimales();
