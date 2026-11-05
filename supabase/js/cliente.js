async function registrarCliente(nombre, correo, contrasena) {
// db.auth.signUp() NO toca ninguna tabla tuya todavía — habla directo con
// el sistema de autenticación interno de Supabase (algo así como una
// tabla especial, auth.users, que tú no administras a mano). Le mandas
// correo y contraseña, y Supabase por detrás: valida el formato del
// correo, guarda la contraseña de forma segura (nunca en texto plano),
// y crea un identificador único nuevo (un uuid) para esta persona.
//
// El resultado llega en dos partes, igual que en todas las llamadas a
// Supabase que ya conoces (data / error):
// - data.user → los datos del usuario recién creado. data.user.id
// es el uuid real — EL MISMO que vamos a usar como id
// en clientes_practica, dos líneas más abajo.
// - data.session → si tu proyecto exige confirmar el correo antes de
// dejar entrar (ver guía, sección 7), esto llega en
// null: el usuario ya existe, pero todavía no hay
// sesión iniciada hasta que confirme.
const { data, error } = await db.auth.signUp({
email: correo,
password: contrasena,
});
// Mismo patrón de "revisar error antes de seguir" que ya usaste en el
// CRUD de productos — si signUp() falló (correo repetido, contraseña
// muy corta, etc.), ni siquiera intentamos el segundo paso.
if (error) {
console.log('Error al registrar:', error);
return null;
}
// Ahora sí tocamos una tabla tuya: clientes_practica. Este insert() es
// igual al que ya usaste en agregarProducto() — la única diferencia es
// que aquí SÍ mandamos el id a mano (data.user.id), en vez de dejar que
// Supabase lo autogenere, porque este id tiene que coincidir exactamente
// con el que Auth le acaba de asignar al usuario.
const { data: cliente, error: errorCliente } = await db
.from('clientes_practica')
.insert([{ id: data.user.id, nombre, correo, rol: 'cliente' }])
.select();
if (errorCliente) {
console.log('Error al crear el perfil:', errorCliente);
return null;
}
return cliente[0];
}
// 'submit' es el evento que dispara un <form> cuando alguien hace clic en
// su botón de tipo submit (o presiona Enter dentro de un campo). Por
// defecto, ese evento hace que el navegador RECARGUE la página entera —
// comportamiento heredado de cuando los formularios mandaban sus datos a
// otra página de servidor, décadas atrás. Como aquí todo lo manejamos con
// JavaScript (sin recargar nada), hay que apagar ese comportamiento a
// propósito.
document.getElementById('form-registro').addEventListener('submit', async (event) => {
// event.preventDefault() le dice al navegador "no hagas lo que harías
// normalmente con este evento" — en este caso, no recargues la página.
// Sin esta línea, la página se refrescaría apenas se hiciera clic en
// "Crear cuenta", y perderías cualquier mensaje que fueras a mostrar.
event.preventDefault();
// event.target es el elemento que disparó el evento — en un 'submit',
// siempre es el propio <form>. Lo guardamos en una variable para poder
// usarlo más abajo (form.reset()) sin tener que volver a buscarlo.
const form = event.target;
const cliente = await registrarCliente(
document.getElementById('registro-nombre').value.trim(),
document.getElementById('registro-correo').value.trim(),
document.getElementById('registro-password').value
);
if (cliente) {
document.getElementById('estado-sesion').textContent =
'Cuenta creada. Ahora inicia sesión con ese correo y contraseña.';
form.reset(); // vacía los 3 campos del formulario, para la próxima persona
} else {
document.getElementById('estado-sesion').textContent =
'No se pudo crear la cuenta. Revisa la consola.';
}
});

async function iniciarSesion(correo, contrasena) {
// db.auth.signInWithPassword() es para alguien que YA se registró antes
// (sección 4.1) — no crea ningún usuario nuevo, solo verifica que el
// correo y la contraseña coincidan con uno que ya existe en Auth.
//
// Lo importante pasa "por detrás", sin que se vea en este código: si la
// verificación sale bien, el cliente de Supabase (la variable db, la
// misma de siempre) GUARDA la sesión internamente — normalmente en el
// almacenamiento del navegador — y, desde este momento, la adjunta sola
// a cada petición futura que hagas con db, sea a productos_practica, a
// clientes_practica o a cualquier otra tabla. No hay que "pasarle" el
// usuario a mano a ninguna otra función.
const { data, error } = await db.auth.signInWithPassword({
email: correo,
password: contrasena,
});
if (error) {
console.log('Error al iniciar sesión:', error);
return null;
}
// Aquí data.user también trae el id real del usuario — el mismo valor
// que auth.uid() va a devolver dentro de cualquier política de RLS
// mientras esta sesión siga activa.
return data.user;
}
// Mismo patrón explicado en el formulario de registro: 'submit' es el
// evento del <form>, y hay que apagar la recarga automática de página.
document.getElementById('form-login').addEventListener('submit', async (event) => {
event.preventDefault(); // evita que el navegador recargue la página
const form = event.target; // el propio <form>, guardado para usar después
const usuario = await iniciarSesion(
document.getElementById('login-correo').value.trim(),
document.getElementById('login-password').value
);
if (usuario) {
// Ya no cambiamos de página: la sidebar vive aquí mismo, así que solo
// cargamos el perfil en ella y la desbloqueamos.
form.reset();
await cargarPerfil(usuario);
} else {
document.getElementById('estado-sesion').textContent =
'Correo o contraseña incorrectos.';
}
});

// ---------- Sidebar de perfil ----------
// Guardamos el usuario de Auth aquí arriba para poder usar su id tanto
// al leer (cargarPerfil) como al actualizar (el submit de form-editar).
let usuarioActual = null;

const camposPerfil = document.getElementById('campos-perfil');
const avisoPerfil = document.getElementById('aviso-perfil');
const btnLogout = document.getElementById('btn-logout');
const mensajeEditar = document.getElementById('mensaje-editar');

// Un <fieldset disabled> desactiva todos los inputs y botones que tiene
// adentro. Así bloquear/desbloquear la sidebar es cambiar UNA propiedad,
// en vez de recorrer campo por campo.
function bloquearSidebar() {
usuarioActual = null;
camposPerfil.disabled = true;
document.getElementById('form-editar').reset(); // vacía los datos del usuario anterior
avisoPerfil.hidden = false;
btnLogout.hidden = true;
mensajeEditar.textContent = '';
document.getElementById('estado-sesion').textContent = 'No has iniciado sesión.';
// Vuelven los formularios y se esconde la tarjeta de bienvenida
document.getElementById('panel-cuenta').hidden = false;
document.getElementById('panel-bienvenida').hidden = true;
}

// LEER + MOSTRAR. Los datos del perfil viven en clientes_practica, no en
// auth.users, así que los buscamos por id (el mismo uuid del registro).
async function cargarPerfil(usuario) {
usuarioActual = usuario;
const { data: cliente, error } = await db
.from('clientes_practica')
.select('nombre, correo, rol, telefono, direccion')
.eq('id', usuario.id)
.single();
if (error) {
console.log('Error al leer el perfil:', error);
}
const nombre = cliente ? cliente.nombre : usuario.email;
// Con sesión, los formularios de registro/login sobran: los
// escondemos y mostramos la tarjeta de bienvenida en su lugar
document.getElementById('saludo').textContent = `¡Hola, ${nombre}!`;
document.getElementById('datos-usuario').textContent = `Entraste con ${usuario.email}`;
document.getElementById('panel-cuenta').hidden = true;
document.getElementById('panel-bienvenida').hidden = false;
if (cliente) {
document.getElementById('editar-nombre').value = cliente.nombre;
document.getElementById('editar-correo').value = cliente.correo;
document.getElementById('editar-rol').value = cliente.rol;
// ?? '' evita que un null se muestre como el texto "null" en el input
document.getElementById('editar-telefono').value = cliente.telefono ?? '';
document.getElementById('editar-direccion').value = cliente.direccion ?? '';
} else {
mensajeEditar.textContent = 'No se encontró tu perfil en clientes_practica.';
}
camposPerfil.disabled = false;
avisoPerfil.hidden = true;
btnLogout.hidden = false;
}

// ACTUALIZAR. update() recibe solo las columnas a cambiar, y el .eq()
// limita el cambio a la fila de este usuario (sin él, irían TODAS).
document.getElementById('form-editar').addEventListener('submit', async (event) => {
event.preventDefault();
// Por si acaso: sin sesión no hay a quién actualizar
if (!usuarioActual) return;
const { data, error } = await db
.from('clientes_practica')
.update({
nombre: document.getElementById('editar-nombre').value.trim(),
telefono: document.getElementById('editar-telefono').value.trim(),
direccion: document.getElementById('editar-direccion').value.trim(),
})
.eq('id', usuarioActual.id)
.select();
if (error) {
console.log('Error al actualizar:', error);
mensajeEditar.textContent = 'No se pudieron guardar los cambios.';
return;
}
// Si RLS bloquea el update, Supabase NO devuelve error: devuelve 0 filas
if (data.length === 0) {
mensajeEditar.textContent = 'No tienes permiso para editar este perfil (revisa RLS).';
return;
}
// El saludo se actualiza con el nombre nuevo al instante
document.getElementById('saludo').textContent = `¡Hola, ${data[0].nombre}!`;
mensajeEditar.textContent = 'Datos guardados ✔';
});

// signOut() borra la sesión del navegador; la sidebar vuelve a bloquearse
btnLogout.addEventListener('click', async () => {
const { error } = await db.auth.signOut();
if (error) {
console.log('Error al cerrar sesión:', error);
return;
}
bloquearSidebar();
});

// Si ya había una sesión activa al abrir la página (por ejemplo, la
// recargaste), cargamos el perfil directo sin pedir login otra vez.
async function revisarSesionActiva() {
const { data } = await db.auth.getUser();
if (data.user) {
await cargarPerfil(data.user);
}
}
revisarSesionActiva();
