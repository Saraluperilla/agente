// efectos.js: efectos de luz que siguen al mouse.
//   1) Foco dentro de paneles, cards e indicadores (--mx, --my)
//   2) Luz global que sigue al cursor por TODA la página
// El dibujo de la luz lo hace styles.css; aquí solo se calcula DÓNDE.

// ---------- 1) Foco dentro de cada cuadro ----------
// Un solo listener en todo el documento (delegación): sirve también para
// las cards que se crean después al buscar.
document.addEventListener('pointermove', (evento) => {
  const elemento = evento.target.closest('.panel, .card, .stat');
  if (!elemento) return;

  // getBoundingClientRect() dice dónde está el elemento en la pantalla.
  // Restando, se obtiene la posición del mouse DENTRO del elemento.
  const caja = elemento.getBoundingClientRect();
  elemento.style.setProperty('--mx', `${evento.clientX - caja.left}px`);
  elemento.style.setProperty('--my', `${evento.clientY - caja.top}px`);
});

// ---------- 2) Luz global ----------
// Un <div> fijo (position: fixed) que se mueve con el mouse. Se crea
// desde JS para no ensuciar el HTML: es solo decoración.
const luzCursor = document.createElement('div');
luzCursor.className = 'luz-cursor';
luzCursor.setAttribute('aria-hidden', 'true');   // los lectores de pantalla lo ignoran
document.body.appendChild(luzCursor);

let posX = 0;
let posY = 0;
let pendiente = false;

document.addEventListener('pointermove', (evento) => {
  // En pantallas táctiles no hay "mouse encima": no se muestra.
  if (evento.pointerType === 'touch') return;

  posX = evento.clientX;
  posY = evento.clientY;
  luzCursor.classList.add('visible');

  // requestAnimationFrame: mueve la luz como máximo una vez por cuadro
  // de pantalla (~60 veces por segundo), aunque el mouse mande más
  // eventos. Así no se pone lenta la página.
  if (!pendiente) {
    pendiente = true;
    requestAnimationFrame(() => {
      // translate mueve el div sin recalcular el diseño de la página
      // (es mucho más rápido que cambiar top/left).
      luzCursor.style.transform = `translate(${posX}px, ${posY}px)`;
      pendiente = false;
    });
  }
});

// Cuando el mouse sale de la ventana, la luz se apaga.
document.documentElement.addEventListener('pointerleave', () => {
  luzCursor.classList.remove('visible');
});
