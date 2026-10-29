// vistas.js: muestra UNA sección a la vez según el #hash de la URL.
//   prueba2.html#productos -> catálogo (pantalla inicial)
//   prueba2.html#buscar    -> buscador
//   prueba2.html#crear     -> formulario de crear ... etc.
// Usar el hash tiene una ventaja: los botones Atrás/Adelante del navegador
// funcionan, y se puede recargar la página sin perder la vista.

const VISTA_INICIAL = 'productos';
const vistas = document.querySelectorAll('.vista');
const linksNav = document.querySelectorAll('.nav a');

function mostrarVista() {
  // location.hash es "#crear" -> slice(1) quita el "#" -> "crear"
  const pedida = location.hash.slice(1);

  // Si el hash no corresponde a ninguna vista (o está vacío), va a la inicial.
  const existe = [...vistas].some(vista => vista.id === pedida);
  const actual = existe ? pedida : VISTA_INICIAL;

  // Oculta todas menos la actual.
  vistas.forEach(vista => {
    vista.hidden = vista.id !== actual;
  });

  // Marca el link activo del menú (aria-current="page" lo usa el CSS).
  linksNav.forEach(link => {
    if (link.hash === `#${actual}`) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  // Cada vista empieza desde arriba.
  window.scrollTo(0, 0);
}

// "hashchange" se dispara cada vez que cambia el # (clic en un link,
// botón Atrás, o location.hash = '...' desde otro script).
window.addEventListener('hashchange', mostrarVista);
mostrarVista();
