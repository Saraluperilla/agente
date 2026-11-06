// ===================== ACCESO DE ADMINISTRADOR =====================
// El panel del CRUD (#panel-admin) arranca oculto. Solo se muestra cuando
// se confirman DOS cosas:
//   1) hay una sesión iniciada en Supabase Auth (db.auth.getUser())
//   2) ese usuario tiene su fila en la tabla admins_practica
// Ojo: ocultar el panel es solo VISUAL. La protección real de los datos
// son las políticas RLS de Supabase (quién puede leer/escribir cada tabla).

const estadoSesion = document.getElementById('estado-sesion-admin');
const zonaAcceso = document.getElementById('zona-acceso-admin');
const panelAdmin = document.getElementById('panel-admin');
const navAdmin = document.getElementById('nav-admin');
const sesionAdmin = document.getElementById('sesion-admin');
const nombreAdmin = document.getElementById('nombre-admin');
const formLogin = document.getElementById('form-login-admin');
const formRegistro = document.getElementById('form-registro-admin');

// Muestra un aviso bajo el header. tipo = 'info' | 'exito' | 'error':
// el CSS lee data-tipo para elegir colores e ícono.
// Los de éxito se esconden solos; info y error se quedan hasta el próximo aviso.
let temporizadorAviso = null;

function avisarSesion(texto, tipo = 'info') {
  clearTimeout(temporizadorAviso);
  estadoSesion.textContent = texto;
  estadoSesion.dataset.tipo = tipo;
  estadoSesion.hidden = texto === '';
  if (texto === '') return;

  // Reinicia la animación de entrada: se quita la clase, se lee
  // offsetWidth (eso obliga al navegador a "aplicar" el cambio ya) y
  // se vuelve a poner. Sin la lectura, quitar y poner en la misma línea
  // no cambia nada y la animación no se repite.
  estadoSesion.classList.remove('aparecer');
  void estadoSesion.offsetWidth;
  estadoSesion.classList.add('aparecer');

  if (tipo === 'exito') {
    temporizadorAviso = setTimeout(() => avisarSesion(''), 4000);
  }
}

// Desactiva el botón mientras se espera a Supabase: evita doble envío
// (dos clics rápidos = dos cuentas o dos logins) y muestra que algo pasa.
function marcarEnviando(formulario, enviando, textoEspera) {
  const boton = formulario.querySelector('button[type="submit"]');
  if (enviando) {
    boton.dataset.textoOriginal = boton.textContent;
    boton.textContent = textoEspera;
  } else {
    boton.textContent = boton.dataset.textoOriginal || boton.textContent;
  }
  boton.disabled = enviando;
}

// Cambia entre la tarjeta de login y la de registro (solo se ve una).
// cual = 'login' o 'registro'. Se pone el foco en el primer input
// para poder escribir de una vez, sin hacer clic.
function mostrarFormAcceso(cual) {
  formLogin.hidden = cual !== 'login';
  formRegistro.hidden = cual !== 'registro';
  const visible = cual === 'login' ? formLogin : formRegistro;
  visible.querySelector('input').focus();
}

// Los enlaces "Regístrate" / "Inicia sesión" dicen a dónde ir en data-mostrar-form.
zonaAcceso.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-mostrar-form]');
  if (!boton) return;
  avisarSesion('');   // borra el mensaje de error del otro formulario
  mostrarFormAcceso(boton.dataset.mostrarForm);   // data-mostrar-form -> dataset.mostrarForm
});

// Admin confirmado: se ve el CRUD y se cargan los productos.
function mostrarPanel(perfil, correo) {
  zonaAcceso.hidden = true;
  panelAdmin.hidden = false;
  navAdmin.hidden = false;
  sesionAdmin.hidden = false;
  nombreAdmin.textContent = `👤 ${perfil.nombre}`;
  nombreAdmin.title = correo;
  avisarSesion('');
  listarProductos();
}

// Sin admin confirmado: se ve el login y se limpia lo que quedó en pantalla,
// para que el próximo que entre no vea datos de la sesión anterior.
function mostrarAcceso(usuario = null) {
  panelAdmin.hidden = true;
  navAdmin.hidden = true;
  zonaAcceso.hidden = false;
  // Siempre se vuelve a la tarjeta de login (sin focus(): al cargar la
  // página no conviene "robar" el foco).
  formLogin.hidden = false;
  formRegistro.hidden = true;
  // Si hay sesión pero NO es admin, igual se muestra "Cerrar sesión"
  // para que pueda salir y entrar con otra cuenta.
  sesionAdmin.hidden = !usuario;
  nombreAdmin.textContent = usuario ? `👤 ${usuario.email}` : '';

  cerrarEdicion();
  resultadoBusqueda.textContent = '';
  document.getElementById('resultado').textContent = '';
}

// Revisa la sesión y decide qué se muestra. La llaman: la carga de la
// página, el login, el registro y el logout.
async function mostrarEstadoSesionAdmin() {
  const { data } = await db.auth.getUser();

  if (!data.user) {
    mostrarAcceso();
    avisarSesion('');
    return;
  }

  // Tener sesión no basta: confirmamos que además exista su fila en
  // admins_practica. maybeSingle() (a diferencia de single()) devuelve
  // null SIN error cuando no hay fila — justo el caso "no es admin".
  const { data: perfil, error } = await db
    .from('admins_practica')
    .select('nombre')
    .eq('id', data.user.id)
    .maybeSingle();

  if (error) {
    mostrarAcceso(data.user);
    avisarSesion('No se pudo verificar tu perfil: ' + error.message, 'error');
    return;
  }

  if (!perfil) {
    mostrarAcceso(data.user);
    avisarSesion(`La cuenta ${data.user.email} no tiene perfil de administrador.`, 'error');
    return;
  }

  mostrarPanel(perfil, data.user.email);
}

formRegistro.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const correo = formRegistro.elements['admin-registro-correo'].value.trim();

  marcarEnviando(formRegistro, true, 'Creando cuenta...');
  const { data, error } = await db.auth.signUp({
    email: correo,
    password: formRegistro.elements['admin-registro-password'].value,
  });

  if (error) {
    marcarEnviando(formRegistro, false);
    avisarSesion('Error al registrar: ' + error.message, 'error');
    return;
  }

  const { error: errorPerfil } = await db.from('admins_practica').insert([{
    id: data.user.id,
    nombre: formRegistro.elements['admin-registro-nombre'].value.trim(),
    correo,
  }]);
  marcarEnviando(formRegistro, false);

  if (errorPerfil) {
    avisarSesion('Cuenta creada, pero falló el perfil: ' + errorPerfil.message, 'error');
    return;
  }

  formRegistro.reset();

  // Si Supabase pide confirmar el correo, signUp() NO deja la sesión
  // abierta (data.session llega null): hay que confirmar y luego entrar.
  // Se vuelve al login con el correo ya escrito.
  if (!data.session) {
    mostrarFormAcceso('login');
    formLogin.elements['admin-login-correo'].value = correo;
    avisarSesion('Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.');
    return;
  }

  // Si no pide confirmación, ya quedó con sesión: entra directo al panel.
  mostrarEstadoSesionAdmin();
});

formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  marcarEnviando(formLogin, true, 'Entrando...');
  const { error } = await db.auth.signInWithPassword({
    email: formLogin.elements['admin-login-correo'].value.trim(),
    password: formLogin.elements['admin-login-password'].value,
  });
  marcarEnviando(formLogin, false);

  if (error) {
    avisarSesion('Error al iniciar sesión: ' + error.message, 'error');
    return;
  }

  formLogin.reset();
  mostrarEstadoSesionAdmin();
});

document.getElementById('btn-logout-admin').addEventListener('click', async () => {
  await db.auth.signOut();
  location.hash = '';               // al volver a entrar, arranca en Productos
  await mostrarEstadoSesionAdmin();
  avisarSesion('Cerraste sesión. ¡Hasta pronto!', 'exito');
});

// La primera llamada a mostrarEstadoSesionAdmin() está al FINAL del archivo:
// usa constantes (catalogo, listaEditar...) que se declaran más abajo, y una
// const no se puede usar antes de su línea (error "Cannot access before initialization").

document.getElementById('btn-traer').addEventListener('click', async () => {

  // "async" convierte esta función (el listener del clic) en una función
  // ASÍNCRONA: una función que PUEDE usar "await" adentro para esperar
  // algo que tarda, sin congelar el resto de la página mientras espera.
  //
  // Diferencia clave con localStorage (semana 7): localStorage.getItem()
  // y localStorage.setItem() son operaciones SINCRÓNICAS — ocurren al
  // instante, en tu propio computador, sin viajar a ningún lado. Por eso
  // nunca necesitaste "async"/"await" para leer o escribir en
  // localStorage. Una consulta a Supabase, en cambio, viaja por internet
  // hasta el servidor de Supabase y la respuesta tiene que volver — eso
  // toma un tiempo real (aunque sea poco), y JavaScript necesita una
  // forma explícita de decir "espera aquí a que llegue la respuesta".

  // "await" pausa la ejecución DE ESTA FUNCIÓN (no de toda la página)
  // hasta que la consulta a Supabase responda. Mientras tanto, el resto
  // de tu página sigue funcionando con normalidad — solo esta función
  // en particular se detiene en esta línea hasta tener respuesta real.
  const { data, error } = await db.from('productos_practica').select('*');

  // Sin "await" en la línea de arriba, "data" y "error" NO tendrían el
  // resultado todavía — tendrías una "Promise" (promesa) sin resolver,
  // no los datos reales. Eso es justo lo que "await" evita: te obliga
  // a esperar antes de seguir usando el resultado.
  console.log(data, error);

   if (error) {
    // Revisamos "error" ANTES de tocar "data": si la consulta falló,
    // "data" llega como null, y usar null más adelante (ej. null.map())
    // rompería el script. Mismo patrón de "validar antes de operar"
    // que ya usaste en el CRUD de la semana 7.
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // JSON.stringify(data, null, 2) convierte el array completo a texto,
  // con sangría (el "2") para que se lea ordenado. Esta línea SÍ es
  // sincrónica (no necesita await) — ya no estamos esperando nada de
  // Supabase, solo transformando el array "data" que ya llegó.
  document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);

const nombres = data.map(producto => producto.nombre);
  // nombres es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos

  document.getElementById('resultado2').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';

const disponibles = data.map(producto => producto.disponible);
  // disponibles es ahora un array de solo booleanos:
  // [true, false, true]
  // — ya no objetos completos

  document.getElementById('resultado3').innerHTML =
    '<ul>' + disponibles.map(d => `<li>${d ? "Sí" : "No"}</li>`).join('') + '</ul>';

const precios = data.map(producto => producto.precio);
  // precios es ahora un array de solo números:
  // [199900, 299900, 399900]
  // — ya no objetos completos

  document.getElementById('resultado4').innerHTML =
    '<ul>' + precios.map(p => `<li>$${p.toLocaleString("es-CO")}</li>`).join('') + '</ul>';

}); // cierra el listener de 'btn-traer' que se abrió en la línea 1

//CRUD: Crear un nuevo producto
const nuevoProducto = {
  nombre: "Teclado Mecánico RGB",
  descripción: "Teclado mecánico con retroiluminación RGB y switches azules.",
  precio: 249900,
  unidades: 30,
  descuento: 0.15,
  disponible: true,
  caracteristicas: ["Switches mecánicos", "Retroiluminación RGB", "Teclas programables"],
  img_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3Z7QkRANNSEHLDIsyUVxA4Bj-zuEcbD9KAK5-S4znoQ&s=10",
}

// AHORA (Supabase):
async function agregarProducto(datos) {

  const { data, error } = await db
    .from('productos_practica')  // la tabla
    .insert([datos])             // insert() siempre recibe un ARRAY de objetos,
                                  // aunque insertes uno solo
    .select();                    // .select() le pide a Supabase que te
                                   // devuelva la fila ya creada (con su id
                                   // nuevo) — sin esto, insert() no te
                                   // devuelve nada útil

  if (error) {
    console.log("Error al agregar:", error);
    return null;
  }

  return data[0];   // data siempre es un array — tomamos el primer
                     // elemento, que es la fila recién creada
}

// Lee los inputs de un formulario de producto y arma el objeto para Supabase.
// Va aparte porque la usan DOS formularios: Crear y Modificar.
// Recibe el <form> como parámetro, así sirve para cualquiera de los dos.
function leerDatosProducto(formulario) {
  // Los inputs SIEMPRE devuelven texto ("150000"), aunque sean type="number".
  // Por eso convertimos con Number() antes de mandarlo a columnas numéricas.
  return {
    nombre: formulario.nombre.value.trim(),
    descripción: formulario.descripcion.value.trim(),   // la columna lleva tilde
    precio: Number(formulario.precio.value),
    unidades: Number(formulario.unidades.value),
    descuento: Number(formulario.descuento.value) / 100, // 15 (%) -> 0.15, como en la tabla
    disponible: formulario.disponible.checked,           // checkbox: se lee .checked, no .value
    caracteristicas: formulario.caracteristicas.value
      .split(',')                 // "tecnología, audio" -> ["tecnología", " audio"]
      .map(c => c.trim())         // quita espacios -> ["tecnología", "audio"]
      .filter(c => c !== ''),     // quita vacíos si sobra una coma
    img_url: formulario.img_url.value.trim(),
  };
}

// FORMULARIO: crea el producto con lo que escribe el usuario
// (en vez del "nuevoProducto" fijo de arriba).
const form = document.getElementById('form-producto');
const notificacion = document.getElementById('notificación');

form.addEventListener('submit', async (evento) => {
  // Sin esto, el navegador recarga la página al enviar el form
  // y se pierde todo antes de que llegue la respuesta de Supabase.
  evento.preventDefault();

  const datos = leerDatosProducto(form);

  notificacion.textContent = 'Guardando...';
  const respuesta = await agregarProducto(datos);

  if (respuesta) {
    notificacion.textContent = `Producto creado: ${respuesta.nombre} (id ${respuesta.id})`;
    form.reset();
    refrescarTodo();
  } else {
    notificacion.textContent = 'Error al crear el producto. Revisa la consola (F12).';
  }
}); // } cierra la función, ) cierra addEventListener(

// AHORA:
async function buscarProductoPorId(id) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .eq('id', id)    // eq = "equal" (igual a) — equivalente a find(p => p.id === id)
    .single();         // single() = "espero exactamente una fila, dámela
                        // como objeto, no como array de un elemento"

  if (error) return null;
  return data;
}

async function buscarProductosPorNombre(texto) {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .ilike('nombre', `%${texto}%`);
    // ilike = "like" insensible a mayúsculas/minúsculas.
    // los símbolos % significan "cualquier texto antes/después" —
    // equivalente a .toLowerCase().includes(texto)

  if (error) return [];
  return data;
}

// AHORA (Supabase resuelve "encontrar y actualizar" en una sola instrucción):
// Va AFUERA de cualquier listener: si se declara dentro de uno, solo existe
// mientras corre ese clic y el resto del archivo no la puede llamar.
async function modificarProducto(id, cambios) {

  const { data, error } = await db
    .from('productos_practica')
    .update(cambios)   // solo actualiza las propiedades que vengan en "cambios"
    .eq('id', id)        // ...de la fila donde el id coincida
    .select();

  if (error) {
    console.log("Error al modificar:", error);
    return null;
  }
  return data[0];
}

// AHORA:
async function eliminarProducto(id) {

  const { error } = await db
    .from('productos_practica')
    .delete()      // borra las filas...
    .eq('id', id); // ...SOLO donde el id coincida. Sin este .eq(),
                   // delete() intentaría borrar TODA la tabla.

  if (error) console.log("Error al eliminar:", error);
  return !error;   // true si NO hubo error (se borró bien), false si falló
}

// Formatea un número como precio colombiano: 150000 -> "$150.000"
const formatoPrecio = (valor) => `$${Math.round(valor).toLocaleString('es-CO')}`;

// Arma la card de UN producto. Va aparte porque se usa en los dos
// buscadores (con map() en el de nombre, directo en el de id).
const crearCardProducto = (producto) => {
  const porcentaje = Math.round(producto.descuento * 100);
  // Precio final = precio con el descuento aplicado (0.15 -> paga el 85%)
  const precioFinal = producto.precio * (1 - producto.descuento);

  return `
    <article class="card">
      <div class="card-img">
        <img src="${producto.img_url}" alt="${producto.nombre}">
        ${porcentaje > 0 ? `<span class="badge-descuento">-${porcentaje}%</span>` : ''}
      </div>
      <div class="card-cuerpo">
        <span class="estado ${producto.disponible ? 'si' : 'no'}">
          ${producto.disponible ? 'Disponible' : 'Agotado'}
        </span>
        <h3>${producto.nombre}</h3>
        <p>${producto['descripción'] || ''}</p>
        <p class="precio">
          ${formatoPrecio(precioFinal)}
          ${porcentaje > 0 ? `<s>${formatoPrecio(producto.precio)}</s>` : ''}
        </p>
        <ul class="chips">
          ${(producto.caracteristicas || []).map(c => `<li>${c}</li>`).join('')}
        </ul>
        <p class="meta">ID ${producto.id} · ${producto.unidades} unidades</p>
      </div>
      <div class="acciones">
        <!-- data-editar guarda el id para saber QUÉ producto editar al hacer clic -->
        <button type="button" data-editar="${producto.id}">Editar</button>
      </div>
    </article>
  `;
};

// BUSCAR POR NOMBRE: conecta el input #form-buscar con buscarProductosPorNombre()
const formBuscar = document.getElementById('form-buscar');
const formBuscarId = document.getElementById('form-buscar-id');
const resultadoBusqueda = document.getElementById('resultado-busqueda');

// Recuerda cuál buscador se usó por última vez (nombre o id), para
// repetir esa búsqueda después de guardar cambios.
let ultimaBusqueda = null;

// ---------- Búsqueda en vivo + sugerencias ----------
// Mientras se escribe, se busca solo (sin dar Enter) y aparece una lista
// de opciones debajo del input. Gracias al ilike('%texto%') basta con
// unas letras: "si" encuentra "Silla Gamer ProMax".

const inputBuscar = formBuscar.nombre_buscar;
const sugerencias = document.getElementById('sugerencias');
const MAX_SUGERENCIAS = 6;

let ultimosResultados = [];     // lo último que llegó de Supabase
let indiceActivo = -1;          // opción marcada con las flechas (-1 = ninguna)
let numeroBusqueda = 0;         // para ignorar respuestas viejas (ver abajo)
let temporizadorBusqueda = null;

// Envuelve en <mark> la parte del nombre que coincide con lo escrito:
// resaltar("Silla Gamer", "lla") -> "Si<mark>lla</mark> Gamer"
function resaltar(nombre, texto) {
  const inicio = nombre.toLowerCase().indexOf(texto.toLowerCase());
  if (inicio === -1 || !texto) return nombre;
  const fin = inicio + texto.length;
  return `${nombre.slice(0, inicio)}<mark>${nombre.slice(inicio, fin)}</mark>${nombre.slice(fin)}`;
}

function ocultarSugerencias() {
  sugerencias.hidden = true;
  inputBuscar.setAttribute('aria-expanded', 'false');
  inputBuscar.removeAttribute('aria-activedescendant');
  indiceActivo = -1;
}

function mostrarSugerencias(productos, texto) {
  if (productos.length === 0) {
    sugerencias.innerHTML = `<li class="sin-resultados">Nada contiene "${texto}"</li>`;
  } else {
    // slice(0, 6): solo las primeras 6 opciones, para que la lista no sea eterna
    sugerencias.innerHTML = productos.slice(0, MAX_SUGERENCIAS).map((producto, i) => `
      <li role="option" id="sug-${i}" data-id="${producto.id}" aria-selected="false">
        <img src="${producto.img_url}" alt="">
        <span>${resaltar(producto.nombre, texto)}</span>
        <small>${formatoPrecio(producto.precio)}</small>
      </li>
    `).join('');
  }
  indiceActivo = -1;
  sugerencias.hidden = false;
  inputBuscar.setAttribute('aria-expanded', 'true');
}

// Marca la opción "activa" cuando se navega con las flechas.
function marcarOpcion(nuevoIndice) {
  const opciones = sugerencias.querySelectorAll('[role="option"]');
  if (opciones.length === 0) return;

  // % hace que "dé la vuelta": bajar desde la última vuelve a la primera.
  indiceActivo = (nuevoIndice + opciones.length) % opciones.length;
  opciones.forEach((opcion, i) => opcion.setAttribute('aria-selected', i === indiceActivo));
  inputBuscar.setAttribute('aria-activedescendant', opciones[indiceActivo].id);
}

// Elegir una sugerencia: pone el nombre en el input y muestra SOLO ese producto.
function elegirSugerencia(id) {
  const producto = ultimosResultados.find(p => p.id === id);
  if (!producto) return;
  inputBuscar.value = producto.nombre;
  ocultarSugerencias();
  resultadoBusqueda.innerHTML = crearCardProducto(producto);
}

// Busca en Supabase y pinta resultados (y sugerencias si se pide).
async function buscarYMostrar(texto, conSugerencias) {
  // Si se escribe rápido salen varias consultas seguidas y pueden llegar
  // en desorden. Cada búsqueda guarda su número; si al volver ya hay una
  // más nueva, esta respuesta vieja se ignora.
  const miNumero = ++numeroBusqueda;

  const productos = await buscarProductosPorNombre(texto);
  if (miNumero !== numeroBusqueda) return;

  ultimosResultados = productos;
  if (conSugerencias) mostrarSugerencias(productos, texto);

  // A diferencia de buscarProductoPorId (que devuelve UN objeto o null),
  // esta función devuelve SIEMPRE un array: vacío si no hay coincidencias.
  // Por eso se revisa .length en vez de !producto.
  if (productos.length === 0) {
    resultadoBusqueda.textContent = `No hay productos que contengan "${texto}".`;
    return;
  }
  resultadoBusqueda.innerHTML = productos.map(crearCardProducto).join('');
}

// "input" se dispara con CADA letra que se escribe o borra.
inputBuscar.addEventListener('input', () => {
  ultimaBusqueda = formBuscar;
  // Aquí NO va Number(): el nombre es texto. trim() quita espacios
  // de más para que " silla " encuentre "Silla Gamer ProMax".
  const texto = inputBuscar.value.trim();

  // "Debounce": espera 250 ms después de la ÚLTIMA tecla antes de buscar.
  // Así escribir "silla" hace 1 consulta, no 5 (una por letra).
  clearTimeout(temporizadorBusqueda);

  if (texto === '') {
    numeroBusqueda++;            // invalida cualquier búsqueda en camino
    ocultarSugerencias();
    resultadoBusqueda.textContent = '';
    return;
  }

  temporizadorBusqueda = setTimeout(() => buscarYMostrar(texto, true), 250);
});

// Teclado: ↓ ↑ para moverse, Enter para elegir, Esc para cerrar.
inputBuscar.addEventListener('keydown', (evento) => {
  if (sugerencias.hidden) return;

  if (evento.key === 'ArrowDown') {
    evento.preventDefault();     // que el cursor no salte al final del texto
    marcarOpcion(indiceActivo + 1);
  } else if (evento.key === 'ArrowUp') {
    evento.preventDefault();
    marcarOpcion(indiceActivo - 1);
  } else if (evento.key === 'Enter' && indiceActivo >= 0) {
    evento.preventDefault();     // que no se envíe el formulario
    const opcion = sugerencias.querySelectorAll('[role="option"]')[indiceActivo];
    elegirSugerencia(Number(opcion.dataset.id));
  } else if (evento.key === 'Escape') {
    ocultarSugerencias();
  }
});

// mousedown (no click): ocurre ANTES de que el input pierda el foco,
// así la lista no se cierra antes de registrar la opción elegida.
sugerencias.addEventListener('mousedown', (evento) => {
  const opcion = evento.target.closest('[role="option"]');
  if (!opcion) return;
  evento.preventDefault();
  elegirSugerencia(Number(opcion.dataset.id));
});

// Al salir del input (clic afuera, Tab), se cierra la lista.
inputBuscar.addEventListener('blur', ocultarSugerencias);

// Enter sin opción marcada (o el botón Buscar): búsqueda normal sin lista.
formBuscar.addEventListener('submit', (evento) => {
  evento.preventDefault();
  ultimaBusqueda = formBuscar;
  clearTimeout(temporizadorBusqueda);
  ocultarSugerencias();
  buscarYMostrar(inputBuscar.value.trim(), false);
});

// BUSCAR POR ID: conecta #form-buscar-id con buscarProductoPorId()
formBuscarId.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  ultimaBusqueda = formBuscarId;

  // Aquí SÍ va Number(): el id es número en la tabla, y el input
  // devuelve texto ("3") aunque sea type="number".
  const id = Number(formBuscarId.id_buscar.value);

  resultadoBusqueda.textContent = 'Buscando...';
  const producto = await buscarProductoPorId(id);

  // buscarProductoPorId devuelve UN objeto o null (por el .single()),
  // por eso aquí se revisa !producto y no .length como en el de nombre.
  if (!producto) {
    resultadoBusqueda.textContent = `No existe un producto con id ${id}.`;
    return;
  }

  // crearCardProducto recibe UN producto: aquí no hace falta map().
  resultadoBusqueda.innerHTML = crearCardProducto(producto);
});

// ===================== MODIFICAR PRODUCTOS =====================
// Lista de todos los productos a la izquierda; al elegir uno, sus
// datos se cargan en #form-editar y al guardar se llama modificarProducto().

const listaEditar = document.getElementById('lista-editar');
const formEditar = document.getElementById('form-editar');
const editorVacio = document.getElementById('editor-vacio');
const tituloEditar = document.getElementById('titulo-editar');
const editorImg = document.getElementById('editor-img');
const editorId = document.getElementById('editor-id');
const notificacionEditar = document.getElementById('notificacion-editar');

const catalogo = document.getElementById('catalogo');

// UNA sola consulta llena tres cosas: el resumen, el catálogo (pantalla
// inicial) y la lista de Modificar. Pide "*" porque las cards del
// catálogo muestran todas las columnas.
async function listarProductos() {
  const { data, error } = await db
    .from('productos_practica')
    .select('*')
    .order('id');

  if (error) {
    listaEditar.innerHTML = `<li class="vacio">Error: ${error.message}</li>`;
    catalogo.innerHTML = `<p class="vacio">Error: ${error.message}</p>`;
    return;
  }

  // Catálogo de la pantalla inicial: mismas cards que el buscador.
  catalogo.innerHTML = data.length === 0
    ? '<p class="vacio">No hay productos todavía. Crea el primero con "+ Nuevo producto".</p>'
    : data.map(crearCardProducto).join('');

  // Resumen de arriba: filter() deja solo los que cumplen la condición,
  // y .length cuenta cuántos quedaron.
  document.getElementById('stat-total').textContent = data.length;
  document.getElementById('stat-disponibles').textContent =
    data.filter(p => p.disponible).length;
  document.getElementById('stat-descuento').textContent =
    data.filter(p => p.descuento > 0).length;

  if (data.length === 0) {
    listaEditar.innerHTML = '<li class="vacio">No hay productos todavía.</li>';
    return;
  }

  // El id del producto que se está editando (si hay uno), para dejarlo marcado.
  const idActivo = formEditar.hidden ? null : Number(formEditar.producto_id.value);

  listaEditar.innerHTML = data.map(producto => `
    <li>
      <button type="button" class="item-producto" data-editar="${producto.id}"
              aria-pressed="${producto.id === idActivo}">
        <img src="${producto.img_url}" alt="">
        <span class="item-texto">
          <strong>${producto.nombre}</strong>
          <small>ID ${producto.id} · ${formatoPrecio(producto.precio)}</small>
        </span>
      </button>
    </li>
  `).join('');
}

// Camino inverso de leerDatosProducto(): de objeto -> inputs.
function cargarEnEditor(producto) {
  formEditar.producto_id.value = producto.id;
  formEditar.nombre.value = producto.nombre;
  formEditar.descripcion.value = producto['descripción'] || '';
  formEditar.precio.value = producto.precio;
  formEditar.unidades.value = producto.unidades;
  formEditar.descuento.value = Math.round(producto.descuento * 100); // 0.15 -> 15
  formEditar.disponible.checked = producto.disponible;
  formEditar.caracteristicas.value = (producto.caracteristicas || []).join(', ');
  formEditar.img_url.value = producto.img_url || '';

  tituloEditar.textContent = producto.nombre;
  editorImg.src = producto.img_url || '';
  editorId.textContent = `ID ${producto.id}`;

  editorVacio.hidden = true;
  formEditar.hidden = false;
  // Si quedó un "¿Seguro?" pendiente de otro producto, se cancela.
  reiniciarBotonEliminar();
}

// Marca en la lista cuál producto está seleccionado.
function marcarSeleccionado(id) {
  listaEditar.querySelectorAll('.item-producto').forEach(boton => {
    boton.setAttribute('aria-pressed', Number(boton.dataset.editar) === id);
  });
}

// Abre un producto en el editor. La usan la lista Y el botón Editar de las cards.
async function abrirEdicion(id) {
  notificacionEditar.textContent = 'Cargando...';

  // Se pide el producto a Supabase en vez de leerlo de la lista:
  // así se edita la versión más reciente, con TODAS sus columnas.
  const producto = await buscarProductoPorId(id);
  if (!producto) {
    notificacionEditar.textContent = `No se encontró el producto con id ${id}.`;
    return;
  }

  cargarEnEditor(producto);
  marcarSeleccionado(id);
  notificacionEditar.textContent = '';
}

function cerrarEdicion() {
  formEditar.reset();
  formEditar.hidden = true;
  editorVacio.hidden = false;
  marcarSeleccionado(null);
  notificacionEditar.textContent = '';
}

// Delegación de eventos: un solo listener en la lista para todos sus botones,
// porque los botones se crean después de cargar la página.
listaEditar.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-editar]');
  if (!boton) return;
  // data-editar="3" llega como texto "3": el id en la tabla es número.
  abrirEdicion(Number(boton.dataset.editar));
});

// El botón Editar de las cards (catálogo Y buscador) abre ese producto
// en la vista Modificar. Cambiar location.hash hace que vistas.js
// muestre esa vista, igual que si se hiciera clic en el menú.
function editarDesdeCard(evento) {
  const boton = evento.target.closest('button[data-editar]');
  if (!boton) return;
  abrirEdicion(Number(boton.dataset.editar));
  location.hash = 'modificar';
}

catalogo.addEventListener('click', editarDesdeCard);
resultadoBusqueda.addEventListener('click', editarDesdeCard);

formEditar.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const id = Number(formEditar.producto_id.value);
  const cambios = leerDatosProducto(formEditar);

  notificacionEditar.textContent = 'Guardando cambios...';
  const actualizado = await modificarProducto(id, cambios);

  if (actualizado) {
    // Se queda abierto con los datos ya guardados, por si quieres seguir editando.
    cargarEnEditor(actualizado);
    notificacionEditar.textContent = `✓ Cambios guardados en "${actualizado.nombre}".`;
    refrescarTodo();
  } else {
    notificacionEditar.textContent = 'Error al guardar. Revisa la consola (F12).';
  }
});

document.getElementById('btn-cancelar-edicion').addEventListener('click', cerrarEdicion);

// ELIMINAR: confirmación en dos clics, en el mismo botón.
// 1er clic -> el botón pasa a "¿Seguro? ..." (data-confirmar="si")
// 2do clic -> llama eliminarProducto()
// Si no se confirma en 4 segundos, el botón vuelve a la normalidad.
const btnEliminar = document.getElementById('btn-eliminar');
let temporizadorEliminar = null;

function reiniciarBotonEliminar() {
  clearTimeout(temporizadorEliminar);
  delete btnEliminar.dataset.confirmar;   // quita el atributo data-confirmar
  btnEliminar.textContent = 'Eliminar producto';
}

btnEliminar.addEventListener('click', async () => {
  const id = Number(formEditar.producto_id.value);
  const nombre = formEditar.nombre.value;

  // Primer clic: solo pide confirmación.
  if (btnEliminar.dataset.confirmar !== 'si') {
    btnEliminar.dataset.confirmar = 'si';
    btnEliminar.textContent = '¿Seguro? Clic otra vez para eliminar';
    temporizadorEliminar = setTimeout(reiniciarBotonEliminar, 4000);
    return;
  }

  // Segundo clic: ahora sí se borra.
  reiniciarBotonEliminar();
  notificacionEditar.textContent = 'Eliminando...';

  // ANTES de borrar se pide la fila completa a Supabase y se guarda una
  // copia: después del delete ya no habría de dónde sacar los datos.
  const copia = await buscarProductoPorId(id);
  const eliminado = await eliminarProducto(id);

  // eliminarProducto devuelve true/false (no un objeto como las otras),
  // por eso aquí basta con if (eliminado).
  if (eliminado) {
    cerrarEdicion();   // el producto ya no existe: no tiene sentido seguir editándolo
    const clave = copia ? guardarEnPapelera(copia) : null;
    // Botón "Deshacer" dentro del mensaje: repone al instante lo que se borró.
    notificacionEditar.innerHTML = `🗑 "${nombre}" (id ${id}) se movió a la papelera.
      ${clave ? `<button type="button" class="enlace" data-reponer="${clave}">Deshacer</button>` : ''}`;
    refrescarTodo();
  } else {
    notificacionEditar.textContent = 'Error al eliminar. Revisa la consola (F12).';
  }
});

// ===================== PAPELERA (reponer eliminados) =====================
// Supabase borra la fila para siempre. Para poder reponerla, guardamos una
// copia en localStorage ANTES de borrar. Ojo: localStorage es de ESTE
// navegador; en otro computador la papelera aparece vacía.

const CLAVE_PAPELERA = 'papeleraProductos';
const listaPapelera = document.getElementById('lista-papelera');
const notificacionPapelera = document.getElementById('notificacion-papelera');

function leerPapelera() {
  // JSON.parse convierte el texto guardado de vuelta en array.
  // "|| '[]'": si todavía no hay nada guardado, empieza con array vacío.
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PAPELERA) || '[]');
  } catch (e) {
    return [];
  }
}

function escribirPapelera(papelera) {
  try {
    localStorage.setItem(CLAVE_PAPELERA, JSON.stringify(papelera));
  } catch (e) {}
  pintarPapelera();
}

// Guarda una copia y devuelve su "clave" (para reponerla después).
// La clave es la hora en milisegundos: así es única aunque se borre
// dos veces un producto con el mismo nombre.
function guardarEnPapelera(producto) {
  const clave = String(Date.now());
  const papelera = leerPapelera();
  papelera.unshift({ clave, eliminadoEn: new Date().toISOString(), producto });
  escribirPapelera(papelera);
  return clave;
}

function quitarDePapelera(clave) {
  escribirPapelera(leerPapelera().filter(item => item.clave !== clave));
}

// Reponer = volver a INSERTAR la copia en Supabase.
// Se quita el "id" con desestructuración: { id, ...datos } separa el id
// y deja todo lo demás en "datos". Supabase le asigna un id NUEVO.
async function reponerProducto(clave) {
  const item = leerPapelera().find(item => item.clave === clave);
  if (!item) return null;

  const { id, ...datos } = item.producto;
  const repuesto = await agregarProducto(datos);   // la misma función de Crear

  if (repuesto) quitarDePapelera(clave);
  return repuesto;
}

function pintarPapelera() {
  const papelera = leerPapelera();

  // Contador en el menú: "Papelera (2)"
  const contador = document.getElementById('contador-papelera');
  contador.textContent = papelera.length;
  contador.hidden = papelera.length === 0;

  if (papelera.length === 0) {
    listaPapelera.innerHTML = '<li class="vacio">La papelera está vacía.</li>';
    return;
  }

  listaPapelera.innerHTML = papelera.map(({ clave, eliminadoEn, producto }) => `
    <li class="item-papelera">
      <img src="${producto.img_url}" alt="">
      <div class="item-texto">
        <strong>${producto.nombre}</strong>
        <small>
          Tenía ID ${producto.id} · ${formatoPrecio(producto.precio)} ·
          eliminado ${new Date(eliminadoEn).toLocaleString('es-CO')}
        </small>
      </div>
      <div class="acciones">
        <button type="button" data-reponer="${clave}">Reponer</button>
        <button type="button" class="secundario" data-olvidar="${clave}">Quitar de la papelera</button>
      </div>
    </li>
  `).join('');
}

// Un solo listener en TODO el documento para los botones de reponer:
// están en la papelera y también en el mensaje "Deshacer" de Modificar.
document.addEventListener('click', async (evento) => {
  const botonReponer = evento.target.closest('button[data-reponer]');
  const botonOlvidar = evento.target.closest('button[data-olvidar]');

  if (botonReponer) {
    botonReponer.disabled = true;   // evita doble clic = producto duplicado
    const repuesto = await reponerProducto(botonReponer.dataset.reponer);
    const mensaje = repuesto
      ? `✓ "${repuesto.nombre}" fue repuesto con el ID ${repuesto.id}.`
      : 'Error al reponer. Revisa la consola (F12).';
    notificacionPapelera.textContent = mensaje;
    notificacionEditar.textContent = mensaje;
    if (repuesto) refrescarTodo();
    botonReponer.disabled = false;
  }

  if (botonOlvidar) {
    // Solo lo quita de la papelera (ya no se podrá reponer).
    quitarDePapelera(botonOlvidar.dataset.olvidar);
    notificacionPapelera.textContent = 'Quitado de la papelera.';
  }
});

pintarPapelera();

// Después de crear o modificar, actualiza todo lo que muestra productos.
function refrescarTodo() {
  listarProductos();
  // Solo vuelve a traer el JSON si ya se había pedido antes.
  if (document.getElementById('resultado').textContent) {
    document.getElementById('btn-traer').click();
  }
  // Repite la última búsqueda para que la card muestre los datos nuevos.
  if (ultimaBusqueda) ultimaBusqueda.requestSubmit();
}

// Al abrir la página: revisa la sesión. Si es un admin, mostrarPanel()
// llama a listarProductos(); si no, se queda en el login sin pedir productos.
mostrarEstadoSesionAdmin();
