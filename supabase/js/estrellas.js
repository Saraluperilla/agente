// estrellas.js: estrellitas ✦ que siguen al mouse (efecto decorativo de RICCIO).
//
// Cómo funciona:
//   1) Cada vez que el mouse se mueve, se crea un <span> con una estrella
//      justo donde está el puntero (position: fixed + clientX / clientY).
//   2) La animación "sparkle" de tienda.css la hace caer, girar y desvanecerse.
//   3) Cuando la animación termina ("animationend"), el <span> se borra,
//      para no llenar la página de elementos.
//
// No se activa en celulares/tablets (no hay mouse) ni si la persona pidió
// "reducir movimiento" en su sistema (accesibilidad).

(() => {
  const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!hasMouse || reduceMotion) return;

  const SHAPES = ['✦', '✧', '★', '⋆'];
  const COLORS = ['#A98ACB', '#69468D', '#F2EAFB', '#E58FB4', '#CDB6E6'];
  const MIN_GAP_MS = 35;     // como máximo ~28 estrellas por segundo
  const MAX_STARS = 30;      // tope de estrellas en pantalla al mismo tiempo

  let lastTime = 0;
  let alive = 0;

  const random = (min, max) => Math.random() * (max - min) + min;
  const pick = (list) => list[Math.floor(Math.random() * list.length)];

  document.addEventListener('mousemove', (event) => {
    const now = performance.now();
    if (now - lastTime < MIN_GAP_MS || alive >= MAX_STARS) return;
    lastTime = now;

    const star = document.createElement('span');
    star.className = 'sparkle';
    star.textContent = pick(SHAPES);
    star.setAttribute('aria-hidden', 'true');   // es decoración: los lectores de pantalla la ignoran

    // Posición y "personalidad" de cada estrella con variables CSS
    star.style.left = `${event.clientX + random(-6, 6)}px`;
    star.style.top = `${event.clientY + random(-6, 6)}px`;
    star.style.setProperty('--size', `${random(10, 18)}px`);
    star.style.setProperty('--color', pick(COLORS));
    star.style.setProperty('--dx', `${random(-18, 18)}px`);
    star.style.setProperty('--dy', `${random(14, 34)}px`);

    document.body.appendChild(star);
    alive++;
    star.addEventListener('animationend', () => {
      star.remove();
      alive--;
    });
  });
})();
