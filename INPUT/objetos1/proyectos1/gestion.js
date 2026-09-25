// Todo el código está dentro de una IIFE (función que se ejecuta apenas
// se define: (() => { ... })()). Las variables y funciones declaradas
// aquí dentro NO son globales, así que desde la consola no existen:
// animales, siguienteId, sesionIniciada y guardarYRefrescar() dan
// ReferenceError. Es la misma idea de "dónde existe una variable" que
// el scope de una función normal.
(() => {
  // Los datos de la página. Arrancan vacíos: se cargan con leerAnimales()
  // (de data.js) solo después de un login correcto.
  let animales = [];
  let siguienteId = 1;

  // La llave de todo el CRUD. Solo el login la pone en true, y como es
  // privada, desde la consola no se puede escribir sesionIniciada = true.
  // Aunque alguien quite el "hidden" de un formulario con el inspector y
  // lo envíe, cada operación revisa esta variable antes de tocar datos.
  let sesionIniciada = false;

  const tablaBody = document.getElementById("tabla-animales-body");

  // Separada en una función (en vez de un forEach suelto) para poder
  // volver a llamarla después de agregar un animal nuevo y que la tabla
  // de "Mostrar todos" se actualice sin recargar la página.
  function renderizarTabla() {
    tablaBody.innerHTML = "";

    animales.forEach((animal) => {
      const fila = document.createElement("tr");

      const id = document.createElement("td");
      id.textContent = animal.id;
      fila.appendChild(id);

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

  // Llena los 3 <select class="select-animal"> (consultar, actualizar y
  // eliminar) con una opción por animal. El value de cada <option> es el
  // id, y el texto "id - nombre" es lo que ve el usuario.
  const selectoresAnimal = document.querySelectorAll(".select-animal");

  function renderizarSelectores() {
    selectoresAnimal.forEach((select) => {
      select.innerHTML = "";

      const opcionVacia = document.createElement("option");
      opcionVacia.value = "";
      opcionVacia.textContent = "— Elige un animal —";
      select.appendChild(opcionVacia);

      animales.forEach((animal) => {
        const opcion = document.createElement("option");
        opcion.value = animal.id;
        opcion.textContent = `${animal.id} - ${animal.nombre}`;
        select.appendChild(opcion);
      });

      // Después de cualquier cambio en "animales" todos los selectores
      // vuelven a "Elige un animal"; disparar "change" hace que cada
      // sección oculte su ficha/formulario (ver los listeners de abajo)
      select.value = "";
      select.dispatchEvent(new Event("change"));
    });
  }

  // Se llama después de crear, actualizar o eliminar: guarda en
  // localStorage y vuelve a pintar todo lo que depende de "animales",
  // para que la página nunca muestre datos viejos.
  function guardarYRefrescar() {
    if (!sesionIniciada) return;

    localStorage.setItem("animales", JSON.stringify(animales));
    renderizarTabla();
    renderizarSelectores();
  }

  // El value de un <select> siempre es texto ("3"), pero los id de los
  // animales son números (3). Por eso se convierte con Number() antes de
  // comparar con ===, que no considera iguales a "3" y 3.
  function buscarAnimal(id) {
    return animales.find((animal) => animal.id === Number(id));
  }

  // Navegación del sidebar: cada botón tiene data-seccion="crear" y existe
  // una <section id="seccion-crear">; mostrarSeccion() oculta las demás y
  // resalta el botón que corresponde a la que queda visible.
  // [data-seccion] deja fuera el botón "Cerrar sesión", que también usa
  // la clase .sidebar-item pero no abre ninguna sección
  const botonesSidebar = document.querySelectorAll(".sidebar-item[data-seccion]");

  function mostrarSeccion(nombreSeccion) {
    document.querySelectorAll(".seccion").forEach((seccion) => {
      seccion.hidden = seccion.id !== `seccion-${nombreSeccion}`;
    });

    botonesSidebar.forEach((boton) => {
      boton.classList.toggle("activo", boton.dataset.seccion === nombreSeccion);
    });
  }

  // "Usuarios registrados" no depende de "animales": lee otra clave del
  // mismo localStorage ("usuariosJuego"), la que llena game.js cuando
  // alguien inicia sesión o se registra desde game.html. Se vuelve a leer
  // cada vez que se abre esta pestaña (no solo al cargar gestion.html),
  // por si se registró gente nueva desde entonces.
  const tablaUsuariosBody = document.getElementById("tabla-usuarios-body");

  function renderizarUsuarios() {
    tablaUsuariosBody.innerHTML = "";

    const usuariosGuardados = localStorage.getItem("usuariosJuego");
    const usuarios = usuariosGuardados ? JSON.parse(usuariosGuardados) : [];

    usuarios.forEach((usuario) => {
      const fila = document.createElement("tr");

      const nombre = document.createElement("td");
      nombre.textContent = usuario.nombre;
      fila.appendChild(nombre);

      const alias = document.createElement("td");
      alias.textContent = usuario.alias;
      fila.appendChild(alias);

      const email = document.createElement("td");
      email.textContent = usuario.email;
      fila.appendChild(email);

      // Ejercicio pide dejar la contraseña visible en texto plano (sin
      // enmascararla con "•••"), a diferencia de como se vería en un
      // sistema real
      const password = document.createElement("td");
      password.textContent = usuario.password;
      fila.appendChild(password);

      // Historial de partidas: cada usuario.intentos lo llena game.js
      // (mostrarVictoria() -> registrarIntento()) al completar el juego
      // de memoria en game.html
      const partidas = document.createElement("td");
      const intentos = usuario.intentos || [];

      if (intentos.length === 0) {
        partidas.textContent = "Sin partidas";
      } else {
        const lista = document.createElement("ul");
        lista.className = "lista-intentos";

        intentos.forEach((intento) => {
          const item = document.createElement("li");
          const fecha = new Date(intento.fecha).toLocaleString();
          item.textContent =
            `${intento.numeroIntentos} intentos · ${formatearTiempoJuego(intento.tiempoSegundos)} · ${fecha}`;
          lista.appendChild(item);
        });

        partidas.appendChild(lista);
      }

      fila.appendChild(partidas);

      tablaUsuariosBody.appendChild(fila);
    });
  }

  // Convierte segundos a "MM:SS" para mostrar el tiempo de cada partida
  // (misma idea que formatearTiempo() en cardgame.js, pero gestion.js no
  // carga ese archivo, así que se repite acá en vez de compartirla)
  function formatearTiempoJuego(segundos) {
    const mm = String(Math.floor(segundos / 60)).padStart(2, "0");
    const ss = String(segundos % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  botonesSidebar.forEach((boton) => {
    boton.addEventListener("click", () => {
      mostrarSeccion(boton.dataset.seccion);
      if (boton.dataset.seccion === "usuarios") {
        renderizarUsuarios();
      }
    });
  });

  // Arma un objeto animal (sin id) a partir de un formulario. La usan
  // Crear y Actualizar, porque ambos formularios tienen los mismos "name"
  // en sus campos (ver gestion.html).
  function leerAnimalDelFormulario(formulario) {
    const datos = new FormData(formulario);

    const animal = {
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
      animal.posicionImagen = posicionImagen;
    }

    return animal;
  }

  // ---------- Crear ----------
  const formCrear = document.getElementById("form-crear");

  formCrear.addEventListener("submit", (e) => {
    // Evita que el formulario recargue la página (comportamiento por
    // defecto de submit), así el arreglo "animales" en memoria no se pierde
    e.preventDefault();
    if (!sesionIniciada) return;

    // siguienteId se usa y luego se incrementa para que el próximo animal
    // no repita el mismo id. El id va primero con el spread (...) para
    // que quede igual que en los objetos de data.js
    const nuevoAnimal = { id: siguienteId, ...leerAnimalDelFormulario(formCrear) };

    animales.push(nuevoAnimal);
    siguienteId++;
    // Sin guardar, el animal nuevo solo viviría en la memoria de esta
    // pestaña: al guardarlo en localStorage, index.html lo puede leer la
    // próxima vez que se abra o se recargue.
    guardarYRefrescar();

    formCrear.reset();
    mostrarSeccion("mostrar-todos");
  });

  // ---------- Consultar ----------
  const selectConsultar = document.getElementById("consultar-id");
  const fichaAnimal = document.getElementById("ficha-animal");

  // Agrega a la ficha una fila "etiqueta: valor" dentro del <dl>
  function agregarDato(lista, etiqueta, valor) {
    const termino = document.createElement("dt");
    termino.textContent = etiqueta;
    const definicion = document.createElement("dd");
    definicion.textContent = valor;
    lista.append(termino, definicion);
  }

  selectConsultar.addEventListener("change", () => {
    const animal = buscarAnimal(selectConsultar.value);
    fichaAnimal.innerHTML = "";
    fichaAnimal.hidden = !animal;
    if (!animal) return;

    const imagen = document.createElement("img");
    imagen.src = animal.imagen;
    imagen.alt = animal.nombre;
    if (animal.posicionImagen) {
      imagen.style.objectPosition = animal.posicionImagen;
    }

    const nombre = document.createElement("h2");
    nombre.textContent = animal.nombre;

    const descripcion = document.createElement("p");
    descripcion.textContent = animal.descripcion;

    const datos = document.createElement("dl");
    agregarDato(datos, "ID", animal.id);
    agregarDato(datos, "Hábitat", animal.habitat);
    agregarDato(datos, "Alimentación", animal.alimentacion);
    agregarDato(datos, "Peso", `${animal.pesoKg} kg`);
    agregarDato(datos, "Peligroso", animal.peligroso ? "Sí" : "No");
    agregarDato(datos, "Habilidades", animal.habilidades.join(", "));

    fichaAnimal.append(imagen, nombre, descripcion, datos);
  });

  // ---------- Actualizar ----------
  const selectActualizar = document.getElementById("actualizar-id");
  const formActualizar = document.getElementById("form-actualizar");

  // Al elegir un animal, se copian sus valores actuales a los campos para
  // que el usuario edite solo lo que quiera cambiar
  selectActualizar.addEventListener("change", () => {
    const animal = buscarAnimal(selectActualizar.value);
    formActualizar.hidden = !animal;
    if (!animal) return;

    // formulario.elements.<name> da acceso a cada campo por su "name"
    const campos = formActualizar.elements;
    campos.nombre.value = animal.nombre;
    campos.imagen.value = animal.imagen;
    campos.posicionImagen.value = animal.posicionImagen || "";
    campos.descripcion.value = animal.descripcion;
    campos.habitat.value = animal.habitat;
    campos.alimentacion.value = animal.alimentacion;
    campos.pesoKg.value = animal.pesoKg;
    campos.habilidades.value = animal.habilidades.join(", ");
    campos.peligroso.checked = animal.peligroso;
  });

  formActualizar.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!sesionIniciada) return;

    const animal = buscarAnimal(selectActualizar.value);
    if (!animal) return;

    // Se modifica el mismo objeto que ya está dentro de "animales" (no una
    // copia), así el cambio se ve en el arreglo sin tener que reemplazarlo.
    // posicionImagen se borra primero porque, si el usuario vació ese
    // campo, leerAnimalDelFormulario() no la trae y Object.assign() no
    // quitaría la vieja.
    delete animal.posicionImagen;
    Object.assign(animal, leerAnimalDelFormulario(formActualizar));

    guardarYRefrescar();
    mostrarSeccion("mostrar-todos");
  });

  // ---------- Eliminar ----------
  const selectEliminar = document.getElementById("eliminar-id");
  const confirmacionEliminar = document.getElementById("eliminar-confirmacion");
  const mensajeEliminar = document.getElementById("eliminar-mensaje");

  selectEliminar.addEventListener("change", () => {
    const animal = buscarAnimal(selectEliminar.value);
    confirmacionEliminar.hidden = !animal;
    if (!animal) return;

    mensajeEliminar.textContent = `¿Seguro que quieres eliminar a "${animal.nombre}" (id ${animal.id})? Esta acción no se puede deshacer.`;
  });

  document.getElementById("btn-eliminar").addEventListener("click", () => {
    if (!sesionIniciada) return;

    const id = Number(selectEliminar.value);

    // filter() crea un arreglo nuevo con todos los animales MENOS el de
    // ese id. Se puede reasignar "animales" porque está declarado con let
    // (con const daría TypeError)
    animales = animales.filter((animal) => animal.id !== id);

    guardarYRefrescar();
    mostrarSeccion("mostrar-todos");
  });

  document.getElementById("btn-cancelar-eliminar").addEventListener("click", () => {
    selectEliminar.value = "";
    confirmacionEliminar.hidden = true;
  });

  // ---------- Login ----------
  // iniciarLogin() viene de login.js: se encarga del formulario y solo
  // ejecuta esta función (el callback) si el login es correcto. La tabla
  // y los selectores NO se pintan al cargar la página: solo aquí, así sin
  // login no hay datos de animales en pantalla.
  iniciarLogin(() => {
    sesionIniciada = true;

    // Los datos se cargan recién ahora, con el login ya validado
    animales = leerAnimales();

    // siguienteId es el id que recibirá el próximo animal creado. Se
    // calcula como el id más alto que ya existe + 1 (en vez de fijarlo en
    // 11), así sigue siendo correcto aunque se hayan agregado animales en
    // sesiones anteriores.
    animales.forEach((animal) => {
      if (animal.id >= siguienteId) {
        siguienteId = animal.id + 1;
      }
    });

    renderizarTabla();
    renderizarSelectores();
    mostrarSeccion("mostrar-todos");
  });
})();
