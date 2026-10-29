// tema.js: botones Claro / Oscuro.
// Solo cambia el atributo data-tema del <html>; los colores viven en
// styles.css como variables (--fondo, --texto...). Con data-tema="oscuro"
// esas variables toman otros valores y TODA la página cambia sola.

const CLAVE_TEMA = 'tema';
const botonesTema = document.querySelectorAll('[data-tema]');

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;   // <html data-tema="oscuro">

  // Marca cuál botón está activo (para el estilo y para lectores de pantalla).
  botonesTema.forEach((boton) => {
    boton.setAttribute('aria-pressed', boton.dataset.tema === tema);
  });

  // localStorage puede fallar (modo incógnito, permisos): por eso el try/catch.
  try { localStorage.setItem(CLAVE_TEMA, tema); } catch (e) {}
}

botonesTema.forEach((boton) => {
  boton.addEventListener('click', () => aplicarTema(boton.dataset.tema));
});

// Al cargar la página: usa el tema guardado, o "claro" si no hay ninguno.
let temaGuardado = 'claro';
try { temaGuardado = localStorage.getItem(CLAVE_TEMA) || 'claro'; } catch (e) {}
aplicarTema(temaGuardado);
