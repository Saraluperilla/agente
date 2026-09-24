# Bitácora de reflexiones — Agente de Talleres

## 2026-09-10 — Exploración de estilo: landing page (css1)

Le pedí a la IA una landing page de 3 secciones (título, imagen, texto) y elegí HTML+CSS separados
en vez de todo en un solo archivo con `<style>` inline, para practicar la separación entre
estructura y estilo. También le pedí que aplicara mi función `resize()` (cambia el texto según el
ancho de pantalla) a un ejercicio que ya tenía, sin tocarle el estilo.

## 2026-09-11 — Exploración de estilo: primera tarjeta de objetos1

Empecé el ejercicio de objetos (`objetos1/`) renderizando `heroe` en una tarjeta básica con CSS
Grid. Le pedí explícitamente que no agrupara todo en un solo `<div>` armado con una plantilla de
texto, sino que cada propiedad tuviera su propia etiqueta HTML — eso me ayudó a entender mejor
cómo se accede a cada propiedad del objeto por separado, en vez de todo junto.

Después probé:
- 3 breakpoints + un botón de modo claro/oscuro usando variables CSS (`--color-*`), en vez de
  escribir los colores sueltos en cada regla.
- Le mandé una imagen de referencia (una carta de juego oscura, con textura "quemada" en los
  bordes y un listón con el nombre) y le pedí que la tarjeta se pareciera a eso. Resultado: la
  tarjeta pasó de ser un rectángulo con la foto arriba a tener la imagen de fondo completa, con
  una viñeta oscura para que el texto se lea encima.
- Generé 12 objetos de héroes (Marvel/DC) para probar la tarjeta con datos reales, y comenté el
  código para entender mejor cómo funcionaba `crearCarta()`.

## 2026-09-16 — Exploración de estilo: colores, tamaño y carrusel (objetos1)

Bastante exploración de estilo hoy, sobre el mismo ejercicio (cambié los datos de héroes a
animales reales).

**Lo que probé y sí quedó:**
- `posicionImagen`, para mover el recorte de las fotos donde la cara del animal no se veía bien.
- Cambiar toda la paleta de rojo a morado — fue un solo cambio porque todos los colores ya
  dependían de variables CSS, no estaban sueltos en cada regla.
- Agrandar las tarjetas de a poco hasta un tamaño que se viera bien en los tres modos.
- Un carrusel tipo "coverflow" (una tarjeta grande al centro, las demás giradas en 3D a los
  lados, como las portadas de Apple Music) que se pasa dejando el mouse quieto un rato sobre una
  tarjeta de los lados — le pedí que el movimiento fuera "más controlado" porque al principio
  saltaba de golpe apenas se tocaba una tarjeta.
- Oscurecer un poco el fondo del modo claro (de `#f1ecf7` a `#d9c7e8`): quedaba casi blanco y el
  botón y la etiqueta de modo casi no se notaban encima.

**Lo que probé y NO quedó al final (lo cambié después):**
- Un carrusel de "páginas" (3 tarjetas visibles en escritorio, 2 en tablet, 1 en teléfono, con
  flechas para pasar de página completa) — funcionaba bien, pero lo reemplacé por el coverflow
  porque quería ese efecto visual en particular.
- La intensidad del brillo "neón": primero la bajé porque se veía muy fuerte, después pedí
  subirla de nuevo porque quedó demasiado sutil — tuve que ir y venir hasta encontrar un punto
  medio.
- Bloquear con `pointer-events: none` las tarjetas que no estaban en el centro, para que no se
  pudieran seleccionar con click. Funcionó, pero cuando después pedí poder "pasarlas" con hover
  tuve que quitar ese bloqueo, porque impedía que el mouse "entrara" en esas tarjetas.

Después de eso le pedí que comentara el código explicando qué hace cada bloque (no cada línea) —
revisó los 3 archivos y completó los bloques que no tenían comentario (sobre todo en el CSS: el
`:root` de colores, el reset, el modal). También me di cuenta de que la intro y las dos primeras
entradas de esta bitácora (`2026-08-20` y `2026-08-22`) venían del ejemplo del curso, no las había
escrito yo ni se las pedí a la IA en este chat — las borré. De ahora en adelante le pedí que
registre acá cada cosa que hablemos, no solo al cierre de la sesión.

Por último le pedí que en celular/tablet las tarjetas se pudieran pasar deslizando el dedo (como
un swipe), ya que el hover que usaba para escritorio no existe en pantallas táctiles. Pidiéndole
que no fuera "muy rápido", el resultado fue un umbral mínimo de 60px de deslizamiento: si el dedo
se mueve menos que eso entre que toca y suelta la pantalla, no pasa de tarjeta (evita que un toque
corto o tembloroso la mueva sin querer).

## 2026-09-17 — Ejercicio nuevo: Arrays (arr2.html)

Empecé `INPUT/Arrays/arr2.html`. Le pedí a la IA solo la base: un `<input type="text">` y un
`<button>`, vinculados en el `<script>` con `getElementById` y nada más (sin lógica, sin
listeners) — quería armar la lógica yo misma encima de esa base. Después seguí directo en el
archivo (sin pedírselo a la IA en este chat): agregué un arreglo de frutas y funciones para
agregar (`push`), eliminar el último (`pop`) y el primero (`shift`), mostrar la lista completa
(`forEach` + `innerHTML`) y buscar un elemento (`indexOf`).

**Cierre de sesión:** me costó entender un poco cómo funcionan los arrays y cómo crearlos, pero
después de practicar con `arr1.html` y `arr2.html` ya lo entendí mucho mejor.

## 2026-09-24 — Ejercicio nuevo: gestión CRUD (objetos1/proyectos1)

Empecé `objetos1/proyectos1/`, una versión aparte del ejercicio de animales. Primero separé el
arreglo `animales` a su propio archivo (`data.js`), y conecté `index.html` para que lo cargue antes
que `index.js` (que ya no declara el arreglo, solo lo usa).

Después armé `gestion.html`: un sidebar a la izquierda con los 4 procesos CRUD (Crear, Consultar,
Actualizar, Eliminar) más "Mostrar todos", cada uno mostrando su propia sección. Por ahora solo
"Mostrar todos" (una tabla) y "Crear" (un formulario con un campo por propiedad del animal) están
armados; los otros tres quedan como placeholder para después.

Para que un animal creado en `gestion.html` también aparezca en el carrusel de `index.html`, agregué
persistencia con `localStorage`: `data.js` revisa si ya hay animales guardados ahí antes de usar el
arreglo por defecto, y `gestion.js` guarda el arreglo actualizado cada vez que se agrega uno. Quedó
pendiente confirmar por qué el `localStorage` aparecía vacío en DevTools al probarlo — sospecha
principal es el tema de abrir los archivos con `file://` en vez de un servidor local.

**Cierre de sesión:** lo que más me costó hoy fue separar `data.js` del resto del código.
