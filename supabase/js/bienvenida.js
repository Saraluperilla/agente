// Guardamos el usuario de Auth aquí arriba para poder usar su id tanto
// al leer (cargarBienvenida) como al actualizar (el submit del form).
let usuarioActual = null;

// Esta página solo tiene sentido si hay una sesión activa. Lo primero
// es preguntarle a Supabase quién es el usuario actual: getUser() lee
// la sesión que signInWithPassword() dejó guardada en el navegador.
async function cargarBienvenida() {
const { data } = await db.auth.getUser();
// Sin sesión (alguien escribió la URL a mano, o la sesión expiró):
// de vuelta al login. replace() para que "atrás" no regrese aquí.
if (!data.user) {
window.location.replace('cliente.html');
return;
}
usuarioActual = data.user;
// PASO 1 — LEER. Los datos del perfil viven en clientes_practica, no
// en auth.users. Los buscamos por id: es el mismo uuid que guardamos
// al registrarse. .single() devuelve un objeto en vez de un arreglo.
const { data: cliente, error } = await db
.from('clientes_practica')
.select('nombre, correo, rol, telefono, direccion')
.eq('id', usuarioActual.id)
.single();
if (error) {
console.log('Error al leer el perfil:', error);
}
// Si no se encontró el perfil, saludamos con el correo como respaldo
const nombre = cliente ? cliente.nombre : usuarioActual.email;
document.getElementById('saludo').textContent = `¡Hola, ${nombre}!`;
document.getElementById('datos-usuario').textContent =
`Entraste con ${usuarioActual.email}`;
// PASO 2 — MOSTRAR. Ponerle .value a un input es lo que "llena" el
// campo: el usuario ve el dato actual y solo cambia lo que quiera.
if (cliente) {
document.getElementById('editar-nombre').value = cliente.nombre;
document.getElementById('editar-correo').value = cliente.correo;
document.getElementById('editar-rol').value = cliente.rol;
// telefono y direccion pueden venir en null (clientes que se
// registraron antes de que existieran esas columnas). Un input con
// .value = null mostraría el texto "null", así que ?? '' lo cambia
// por un campo vacío.
document.getElementById('editar-telefono').value = cliente.telefono ?? '';
document.getElementById('editar-direccion').value = cliente.direccion ?? '';
}
}

// PASO 3 — ACTUALIZAR. Mismo patrón de submit que en cliente.js:
// preventDefault() para que el navegador no recargue la página.
document.getElementById('form-editar').addEventListener('submit', async (event) => {
event.preventDefault();
const mensaje = document.getElementById('mensaje-editar');
const nombre = document.getElementById('editar-nombre').value.trim();
const telefono = document.getElementById('editar-telefono').value.trim();
const direccion = document.getElementById('editar-direccion').value.trim();
// update() recibe SOLO las columnas a cambiar; las demás quedan igual.
// El .eq() es clave: sin él, el update apuntaría a TODAS las filas.
// .select() al final hace que Supabase devuelva la fila ya cambiada.
const { data, error } = await db
.from('clientes_practica')
.update({ nombre, telefono, direccion })
.eq('id', usuarioActual.id)
.select();
if (error) {
console.log('Error al actualizar:', error);
mensaje.textContent = 'No se pudieron guardar los cambios.';
return;
}
// Ojo: si RLS bloquea el update, Supabase NO devuelve error — solo
// devuelve 0 filas. Por eso revisamos también que data tenga algo.
if (data.length === 0) {
mensaje.textContent = 'No tienes permiso para editar este perfil (revisa RLS).';
return;
}
document.getElementById('saludo').textContent = `¡Hola, ${data[0].nombre}!`;
mensaje.textContent = 'Datos guardados ✔';
});

// ---------- Abrir / cerrar el aside ----------
// El panel no se crea ni se destruye: siempre está en el HTML. Abrirlo
// es solo agregarle la clase "abierto", y el CSS se encarga de la
// animación (transform + transition). JS decide el estado, CSS lo dibuja.
const aside = document.getElementById('aside-editar');
const fondoAside = document.getElementById('fondo-aside');
const btnAbrir = document.getElementById('btn-abrir-editar');

function abrirAside() {
aside.classList.add('abierto');
fondoAside.hidden = false;
aside.setAttribute('aria-hidden', 'false');
btnAbrir.setAttribute('aria-expanded', 'true');
document.getElementById('mensaje-editar').textContent = '';
document.getElementById('editar-nombre').focus();
}

function cerrarAside() {
aside.classList.remove('abierto');
fondoAside.hidden = true;
aside.setAttribute('aria-hidden', 'true');
btnAbrir.setAttribute('aria-expanded', 'false');
btnAbrir.focus(); // devuelve el foco al botón que abrió el panel
}

btnAbrir.addEventListener('click', abrirAside);
document.getElementById('btn-cerrar-editar').addEventListener('click', cerrarAside);
fondoAside.addEventListener('click', cerrarAside);
// 'keydown' en document escucha teclas en toda la página
document.addEventListener('keydown', (event) => {
if (event.key === 'Escape' && aside.classList.contains('abierto')) {
cerrarAside();
}
});

// signOut() borra la sesión guardada en el navegador. Después de esto,
// getUser() devuelve null y db vuelve a hacer peticiones como anónimo.
document.getElementById('btn-logout').addEventListener('click', async () => {
const { error } = await db.auth.signOut();
if (error) {
console.log('Error al cerrar sesión:', error);
return;
}
window.location.replace('cliente.html');
});
cargarBienvenida();
