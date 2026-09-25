// Regla del email: texto sin espacios ni "@" antes de la arroba, un "@",
// más texto sin espacios ni "@" después, con al menos un punto (para el
// dominio, ej. ".com"). No es la regla exhaustiva del estándar de email
// (esa es enorme), pero cubre los casos típicos de este ejercicio.
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regla de la contraseña: al menos 6 dígitos, 1 mayúscula y 1 carácter
// especial. Los tres (?=...) son "lookaheads": cada uno solo comprueba
// que esa condición exista en algún lugar del texto, sin consumir
// caracteres, así las tres se pueden combinar sin pisarse entre sí.
// (?:.*\d){6,} pide que aparezca un dígito, 6 veces o más, en cualquier
// posición del texto (no tienen que estar seguidos).
const REGEX_CONTRASENA = /^(?=(?:.*\d){6,})(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

// Clave única bajo la que se guarda el arreglo de usuarios registrados,
// para no chocar con la clave "animales" que ya usa data.js/gestion.js
// en el mismo localStorage (es el mismo origen para todas las páginas).
const CLAVE_USUARIOS = "usuariosJuego";

// localStorage guarda solo texto, por eso se usa JSON.parse() al leer
// (y JSON.stringify() al escribir). Si todavía no hay nada guardado,
// devuelve un arreglo vacío en vez de null, así el resto del código
// puede usar .find()/.push() sin revisar ese caso aparte.
//
// También rellena "id" e "intentos" en los usuarios que se hayan
// guardado antes de que existieran (mismo tipo de migración que hace
// leerAnimales() en data.js con los animales sin id).
function leerUsuarios() {
  const guardados = localStorage.getItem(CLAVE_USUARIOS);
  const usuarios = guardados ? JSON.parse(guardados) : [];

  usuarios.forEach((usuario) => {
    if (usuario.id === undefined) {
      usuario.id = siguienteId(usuarios);
    }
    if (!usuario.intentos) {
      usuario.intentos = [];
    }
  });

  return usuarios;
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

// Calcula el próximo id libre de una lista de objetos con "id": el más
// alto que ya exista, más 1. La usan tanto los usuarios (siguienteId(usuarios))
// como los intentos de un usuario (siguienteId(usuario.intentos)).
function siguienteId(lista) {
  let maximo = 0;
  lista.forEach((elemento) => {
    if (elemento.id > maximo) {
      maximo = elemento.id;
    }
  });
  return maximo + 1;
}

// Muestra el mensaje final del formulario (login correcto, contraseña
// incorrecta, registro nuevo, registro cancelado). "tipo" es "exito" o
// "error", y reusa las mismas clases .login-exito/.login-error que ya
// tienen los mensajes de email y contraseña.
const mensajeFinal = document.getElementById("game-mensaje");

function mostrarMensajeFinal(texto, tipo) {
  mensajeFinal.textContent = texto;
  mensajeFinal.className = tipo === "exito" ? "login-exito" : "login-error";
  mensajeFinal.hidden = false;
}

// Pantalla de bienvenida: reemplaza por completo el formulario de login
// (en vez de solo mostrar un mensaje debajo del botón) cuando el login o
// el registro salen bien.
const pantallaLogin = document.getElementById("pantalla-login");
const pantallaBienvenida = document.getElementById("pantalla-bienvenida");
const bienvenidaMensaje = document.getElementById("bienvenida-mensaje");

function mostrarPantallaBienvenida(texto) {
  bienvenidaMensaje.textContent = texto;
  pantallaLogin.hidden = true;
  pantallaBienvenida.hidden = false;
}

// Email de la persona que inició sesión o se acaba de registrar. La
// necesita registrarIntento() (más abajo) para saber a qué usuario
// guardarle el intento, ya que cardgame.js no sabe nada de logins.
let emailUsuarioActual = null;

// La llama cardgame.js (mostrarVictoria()) cada vez que se completa una
// partida. Busca al usuario actual por email, le agrega un intento nuevo
// con su propio id, la fecha y el resultado, y guarda todo de nuevo.
function registrarIntento(numeroIntentos, tiempoSegundos) {
  if (!emailUsuarioActual) return;

  const usuarios = leerUsuarios();
  const usuario = usuarios.find((u) => u.email === emailUsuarioActual);
  if (!usuario) return;

  // toISOString() da una fecha+hora completa y sin ambigüedad
  // (año-mes-día + hora en UTC), fácil de ordenar u comparar después
  const intento = {
    id: siguienteId(usuario.intentos),
    fecha: new Date().toISOString(),
    numeroIntentos,
    tiempoSegundos,
  };

  usuario.intentos.push(intento);
  guardarUsuarios(usuarios);
}

// "Volver" regresa al formulario ya vacío, por si quieren probar con
// otro usuario sin recargar la página
document.getElementById("btn-volver-login").addEventListener("click", () => {
  formGame.reset();
  mensajeFinal.hidden = true;
  pantallaBienvenida.hidden = true;
  pantallaLogin.hidden = false;
});

// "Jugar memoria" pasa de la bienvenida al tablero. reiniciarJuego() es
// de cardgame.js: arma un tablero nuevo con 6 animales al azar cada vez,
// así que sirve igual la primera vez que si se vuelve a jugar después.
const pantallaJuego = document.getElementById("pantalla-juego");

document.getElementById("btn-jugar-memoria").addEventListener("click", () => {
  pantallaBienvenida.hidden = true;
  pantallaJuego.hidden = false;
  reiniciarJuego();
});

const formGame = document.getElementById("form-game");

const inputEmail = document.getElementById("game-email");
const mensajeErrorEmail = document.getElementById("game-email-error");
const mensajeExitoEmail = document.getElementById("game-email-exito");

const inputPassword = document.getElementById("game-password");
const mensajeErrorPassword = document.getElementById("game-password-error");
const mensajeExitoPassword = document.getElementById("game-password-exito");

// Revisa el email actual contra la regla y muestra el mensaje que
// corresponde. Misma idea que actualizarValidacionPassword() de abajo,
// separada en su propia función por la misma razón: la necesitan tanto
// "input" (mientras se escribe) como "submit" (al final).
function actualizarValidacionEmail() {
  const emailValido = REGEX_EMAIL.test(inputEmail.value);

  mensajeErrorEmail.hidden = emailValido;
  mensajeExitoEmail.hidden = !emailValido;

  return emailValido;
}

function actualizarValidacionPassword() {
  const contrasenaValida = REGEX_CONTRASENA.test(inputPassword.value);

  mensajeErrorPassword.hidden = contrasenaValida;
  mensajeExitoPassword.hidden = !contrasenaValida;

  return contrasenaValida;
}

// "input" dispara en cada tecla (a diferencia de "change", que solo
// dispara cuando el campo pierde el foco): así el mensaje de abajo de
// cada campo se actualiza mientras se escribe, no recién al enviar
inputEmail.addEventListener("input", actualizarValidacionEmail);
inputPassword.addEventListener("input", actualizarValidacionPassword);

formGame.addEventListener("submit", (e) => {
  // Evita que el formulario recargue la página; así se puede mostrar el
  // mensaje de error sin perderlo de inmediato
  e.preventDefault();

  // Sin "||" corto: se llaman las dos funciones siempre, así ambos
  // mensajes quedan actualizados aunque el primero ya haya fallado
  const emailValido = actualizarValidacionEmail();
  const contrasenaValida = actualizarValidacionPassword();

  // Si cualquiera de los dos no cumple su regla, no se deja continuar
  if (!emailValido || !contrasenaValida) return;

  const email = inputEmail.value;
  const password = inputPassword.value;

  const usuarios = leerUsuarios();
  const usuarioExistente = usuarios.find((usuario) => usuario.email === email);

  if (usuarioExistente) {
    // El email ya está registrado: solo entra si la contraseña coincide
    // con la que se guardó en su momento
    if (usuarioExistente.password === password) {
      emailUsuarioActual = usuarioExistente.email;
      mostrarPantallaBienvenida(`¡Bienvenido de nuevo, ${usuarioExistente.alias}!`);
    } else {
      mostrarMensajeFinal("La contraseña no coincide con la de ese email.", "error");
    }
    return;
  }

  // No hay ningún usuario con ese email: en vez de registrar directo, se
  // confirma con la persona (por si escribió mal su email de siempre)
  const quiereRegistrarse = confirm(
    "No encontramos una cuenta con ese email. ¿Quieres registrarte como jugador nuevo?"
  );

  if (!quiereRegistrarse) {
    mostrarMensajeFinal("Registro cancelado.", "error");
    return;
  }

  const nuevoUsuario = {
    id: siguienteId(usuarios),
    nombre: document.getElementById("game-nombre").value,
    alias: document.getElementById("game-alias").value,
    email,
    password,
    intentos: [],
  };

  usuarios.push(nuevoUsuario);
  guardarUsuarios(usuarios);

  emailUsuarioActual = nuevoUsuario.email;
  mostrarPantallaBienvenida(`¡Registro exitoso! Bienvenido, ${nuevoUsuario.alias}.`);
});
