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

## 2026-09-24 — CRUD completo, login y filtro por hábitat (objetos1/proyectos1)

Retomé `proyectos1`. Cada animal tiene ahora un `id` propio, y `siguienteId` asigna ids a los que
se crean después. Terminé las secciones Consultar, Actualizar y Eliminar de `gestion.html`: cada una
elige el animal con un `<select>` y usa `find()` para buscarlo o `filter()` para quitarlo.

Agregué un login con `credenciales.js` y `login.js`. Después hice pruebas de seguridad desde la
consola: con `push`, `pop` y un ciclo `for` pude crear y borrar animales sin iniciar sesión. Para
repararlo encerré el CRUD en una IIFE con una variable privada `sesionIniciada`, y el login le avisa
a `gestion.js` mediante un callback. Aprendí que un login solo en el navegador no es seguridad real:
`localStorage` se puede seguir editando desde la consola, y protegerlo del todo necesita un servidor.

En `index.html` creé `renderizarObjetos(listaObjetos)`, que limpia la galería antes de pintar, y con
ella armé un filtro por hábitat cuyos botones se generan desde los datos con `new Set()`.

Errores del día:
- `ReferenceError: animales is not defined`: ejecuté código en la consola de una pestaña que no
  cargaba `data.js`. Es el 3.er `ReferenceError` del registro; tema a repasar: scope.
- Un ciclo `for` con `i < animales.length` y `pop()` borraba solo la mitad, porque el largo del
  arreglo cambiaba mientras el ciclo avanzaba.

**Cierre de sesión:** no tuve una reflexión propia hoy; este resumen lo escribió el agente a mi pedido.

## 2026-09-25 — Filtros en index.html, juego de memoria y registro de partidas (objetos1/proyectos1)

Retomé `proyectos1` para varias cosas sueltas:

**Filtros de `index.html`:** agregué un slider vertical flotante para filtrar por `pesoKg`
("hasta X kg", con el evento `input` para que se actualice en cada movimiento del thumb, no solo al
soltarlo), y un botón "Restablecer filtros". Después cambié el filtro de hábitat de botones a un
`<select>` desplegable, y le quité la flecha nativa del navegador (`appearance: none` +
`::after` propio) para que combinara con el resto de la interfaz en vez de verse como un control del
sistema operativo.

**Juego de memoria (`game.html`):** primero armé el login/registro del juego (formulario con nombre,
alias, email y contraseña, cada uno con su propia regex validada en vivo con `input`; la contraseña
exige 6 dígitos, 1 mayúscula y 1 carácter especial). Login y registro quedan en `localStorage` bajo
`"usuariosJuego"`, con `confirm()` preguntando si alguien sin cuenta quiere registrarse.

Encontré una carpeta de ejemplo (`ejemplojuego/cardgame`, un juego de memoria de CodePen) y le pedí a
la IA que evaluara si se podía adaptar con los animales de `data.js` en vez de sus productos de
tienda. Terminamos con `cardgame.js`/`cardgame.css`: 6 animales al azar por partida (no siempre los
mismos 10), reverso de carta con ícono en vez de una imagen externa rota que traía el ejemplo, y sin
el "código de descuento" del modal de victoria (no tenía sentido para animales). Al principio la
pantalla del juego se veía con la paleta propia del ejemplo (colores y tipografía de CodePen); le pedí
que la rehiciera con las mismas variables `--color-*` y componentes (píldoras, paneles con
degradado) del resto del sitio, para que no se sintiera como una página aparte.

Por último, cada partida ganada ahora se guarda dentro del usuario que la jugó: un arreglo
`usuario.intentos` con `id`, `fecha`, `numeroIntentos` (volteos) y `tiempoSegundos`. Los usuarios
guardados antes de este cambio se migran solo (se les asigna `id` e `intentos: []` la primera vez que
se leen), mismo patrón que ya usaba `data.js` para los animales sin `id`. Ese historial también quedó
visible en la pestaña "Usuarios registrados" de `gestion.html`.

**Cierre de sesión:** no tuve una reflexión propia hoy; este resumen lo escribió el agente a mi pedido.

## 2026-10-15

Empecé el proyecto `supabase/`: pasar los animales de `proyectos1` (que vivían en un arreglo de
`data.js` + `localStorage`) a una tabla real en Supabase.

**Estructura y orden de scripts:** `index.html` carga 4 scripts en orden — CDN de `supabase-js` →
`supabaseClient.js` (crea el client) → `datos.js` (consultas) → `gestion.js` (DOM). Cada uno depende
del anterior; si se cambia el orden sale `ReferenceError`.

**Lo que armamos:**
- `sql/create_table.sql`: tabla `animales` con las columnas de `data.js` (`pesoKg` pasó a `peso_kg`
  porque Postgres pasa a minúsculas los nombres sin comillas), políticas RLS abiertas para `anon` y
  3 animales de ejemplo.
- `datos.js`: CRUD con `async`/`await`. Supabase no lanza errores, devuelve `{ data, error }`, así
  que se revisa `error` y se hace `throw` para atraparlo con `try`/`catch` en `gestion.js`.
- `gestion.js`: cards, formulario crear/editar, eliminar con confirmación en el mismo botón,
  filtro por hábitat y delegación de eventos.
- `prueba.html` + `js/prueba.js`: ejercicio mínimo de la guía (botón "Traer productos"); el código
  de los Pasos 2–4 queda por escribir.

**Decisiones:** sin login por ahora (primero entender el CRUD; Auth después). El client se llama
`supabaseClient` para no tapar el global `supabase` del CDN, con alias `db` para seguir la guía.

**Errores/conceptos para recordar:**
- `form.id` devuelve el atributo `id` del `<form>`, no un input llamado `id` → el input se renombró
  a `animal_id`.
- `SUPABASE_URL` quedó con `/rest/v1/` al final: hay que dejar solo la Project URL, porque
  `createClient` agrega esa ruta solo. **Pendiente de corregir.**
- La `anon key` puede ir en el repo (es pública); la `service_role key` nunca.

**Cierre de sesión:** no tuve una reflexión propia hoy; este resumen lo escribió el agente a mi pedido.

## 2026-10-16

Seguí con `supabase/prueba.html`, ahora con la tabla `productos_practica` que usamos en clase.

**Error del día:** `PGRST205: Could not find the table 'public.productos_practica'` (404) al consultar
desde la consola. La tabla sí existía; la causa era el pendiente de ayer: `SUPABASE_URL` tenía
`/rest/v1/` al final. Quedó solo la Project URL y la consulta devolvió los productos. **Resuelto.**
Para revisar un `PGRST205`, en orden: proyecto correcto → nombre exacto → esquema `public` →
`notify pgrst, 'reload schema';`.

**Lo que armamos en `prueba.js`:**
- Los Pasos 3 y 4 quedaron comentados: había dos listeners en el mismo botón escribiendo en el
  mismo `#resultado`, y ganaba el que terminara de último.
- Tabla con todos los productos: `map()` arma una `<tr>` por producto y `join('')` las une.
  `precio` con `toLocaleString('es-CO')`, `descuento` con `Math.round(descuento * 100)` (porque
  `0.15 * 100` da `15.000000000000002`), `disponible` con ternario, `caracteristicas` (array) con
  `join(', ')`, y `producto['descripción']` porque la columna lleva tilde.
- Columna de imagen con `img_url` (ya estaba en Supabase), en miniatura 80×80 con `object-fit: cover`.
- Se probó en el celular sirviendo la carpeta en la red local (`http://IP-del-PC:8080`).

**Pendiente:** la tabla `animales` no existe en este proyecto de Supabase (si se vuelve al CRUD hay que
correr `sql/create_table.sql`). `datos.js` y `gestion.js` están vacíos en la carpeta y se dejaron
fuera del commit.

**Cierre de sesión:** no tuve una reflexión propia hoy; este resumen lo escribió el agente a mi pedido.

## 2026-10-22

Seguí con `supabase/`, ahora conectando de verdad con mi tabla `productos_practica`
(id, nombre, descripción, precio, unidades, descuento, disponible, caracteristicas, img_url).

**El botón "Traer productos" no funcionaba por 3 razones encadenadas:**
1. `prueba.js` no tenía `addEventListener`: un botón sin listener no hace nada y tampoco da error.
2. `SUPABASE_URL` terminaba en `/rest/v1/` — se dejó solo la Project URL, porque `createClient`
   agrega esa ruta solo.
3. El código pedía la tabla `productos`, pero la mía se llama `productos_practica`. Supabase
   respondía `PGRST205: Could not find the table` — el nombre tiene que coincidir letra por letra.
   La clave fue mirar el nombre exacto en Table Editor en vez de suponerlo.

Con eso, `prueba.js` ya trae los 3 productos (al hacer merge quedó la versión con tabla e imágenes del 2026-10-16).

**`prueba2.js`:** tenía un `SyntaxError: Unexpected token ')'`. El listener de `btn-traer` nunca
se cerraba y el último terminaba en `)}` en vez de `});`. Un error de sintaxis hace que NO se
ejecute nada del archivo, por eso fallaban todos los botones. Aprendí a revisar con
`node --check archivo.js` y que `addEventListener( ... => { ... });` se cierra en orden inverso.
Además en ese archivo practiqué `.map()` para sacar arrays de solo nombres, disponibles y precios.

**Formulario para crear productos (`prueba2.html`):** reemplazó al botón que insertaba siempre el
mismo teclado. Conceptos: `evento.preventDefault()` para que el form no recargue la página,
`Number()` porque los inputs siempre devuelven texto, `.checked` para checkbox, descuento en % → /100,
y `.split(',').map(trim).filter()` para pasar texto a array. `insert()` recibe un array y con
`.select()` devuelve la fila creada con su id.

**Pendientes:**
- Probar el formulario; si sale `null value in column "id"`, activar Is Identity en `id`.
- La tabla tiene RLS disabled: cualquiera con la anon key (que está en GitHub) puede modificarla.

**Cierre de sesión:** no tuve una reflexión propia hoy; este resumen lo escribió el agente a mi pedido.

## 2026-10-23

Seguí con `supabase/`, dándole estilo a todo y agregando un buscador en `prueba2.html`.

**CSS para todo:** las 3 páginas (`index.html`, `prueba.html`, `prueba2.html`) usan ahora la misma
hoja, `css/styles.css`, en vez de un `<style>` en cada archivo. Así todas se ven iguales y un cambio
se hace en un solo lugar. El `<style>` de la tabla de `prueba.html` pasó a la hoja. `prueba2.html`
quedó con `header` + `main` + `.panel`, igual que `index.html`. En el form se quitaron los `<p>` y
`<br>`, porque `label { display: grid }` ya pone cada input debajo de su texto.
- `:empty { display: none; }` esconde `#resultado`, `#notificación` y `#resultado-busqueda`
  mientras no tienen contenido.
- `:hover` y `:focus-visible` en botones e inputs.

**Error del día (scope):** `buscarProductoPorId` y `buscarProductosPorNombre` quedaron **dentro**
del listener del `submit`, porque el `});` de cierre había quedado al final del archivo. Una
función declarada dentro de otra solo existe ahí adentro, y además solo se creaba al enviar el
form. Se arregló moviendo el `});` justo después del `else`. Es el mismo tema que los
`ReferenceError` anteriores: **scope**.

**Buscador:** primero conecté un input con `buscarProductoPorId` y después lo cambié para buscar
por nombre con `buscarProductosPorNombre`, que usa `.ilike('nombre', '%texto%')`. La card quedó
en su propia función, `crearCardProducto`, para usarla con `map()` cuando llegan varios resultados.
- Por ID, `.single()` devuelve **un objeto o `null`** → se revisa con `if (!producto)`.
- Por nombre, siempre llega **un array**, vacío si no hay coincidencias → se revisa con
  `if (productos.length === 0)`. Ojo: `[]` es *truthy*, así que `if (!productos)` nunca entraría.
- Por ID se usa `Number()` porque la columna `id` es numérica. Por nombre se usa `trim()`.
- El input se llama `nombre_buscar` para no chocar con el `nombre` del form de crear.

**Pendientes:**
- `#notificación` lleva tilde en el `id`. Funciona, pero conviene renombrarlo a `notificacion`
  (también en `prueba2.js`).
- `buscarProductoPorId` quedó en el archivo sin usarse.
- Siguen los pendientes del 2026-10-22 (Is Identity en `id`, RLS disabled).

**Cierre de sesión:** no tuve una reflexión propia hoy; este resumen lo escribió el agente a mi pedido.

## 2026-10-29

Hice `git pull` (traía el CSS compartido y el buscador por nombre del 2026-10-23) y seguí con
`prueba2.html`, que ahora tiene el **CRUD completo** y bastante diseño.

**Error del día (scope, otra vez):** pegué `modificarProducto` **dentro** del listener del
buscador, antes de su `});`. Ahí la función solo existía mientras corría ese clic. Se movió al
nivel principal del archivo. Es la tercera vez que el problema es dónde vive una variable o
función (ver `registro_errores.csv`): **conviene repasar scope**.

**CRUD:**
- **Modificar:** sección propia con la lista de todos los productos a la izquierda y el editor a
  la derecha. `leerDatosProducto(formulario)` sirve para Crear y Modificar; `cargarEnEditor()` hace
  el camino inverso (objeto -> inputs). `update()` sin `.eq('id', id)` cambiaría toda la tabla.
- **Buscar por ID:** usa `buscarProductoPorId()` (un objeto o `null`, por eso `if (!producto)`).
- **Eliminar:** `eliminarProducto()` devuelve `true/false` (`return !error`). Confirmación en dos
  clics con `data-confirmar` y `setTimeout`. `delete()` sin `.eq()` borraría toda la tabla.
- **Papelera:** antes de borrar se guarda una copia en `localStorage`; "Reponer" la vuelve a
  insertar con `{ id, ...datos }` (sale con ID nuevo). Hay botón "Deshacer" justo después de
  borrar. Solo guarda lo borrado desde ese navegador.
- Los **Audífonos Bluetooth X200** se habían borrado antes de existir la papelera; el agente los
  reinsertó con los datos que teníamos (quedaron con **id 8**; la descripción se completó como
  "...cancelación de ruido").
- **Búsqueda en vivo:** evento `input` + debounce de 250 ms; con unas letras ya salen resultados
  (`ilike('%texto%')`). Lista de sugerencias con la parte que coincide en `<mark>`, flechas ↑↓,
  Enter y Esc, y un contador para ignorar respuestas viejas.

**Organización y diseño:**
- **Vistas** (`vistas.js`): la pantalla inicial solo muestra el catálogo y el resumen; Buscar,
  Crear, Modificar, Papelera y Datos van en el menú y se cambian con `location.hash` + `hashchange`.
- **Modo claro / oscuro** (`tema.js`): todos los colores en variables CSS; el tema cambia
  `data-tema` en `<html>` y se guarda en `localStorage`.
- **Paleta "atardecer claro"** en pastel (durazno, rosa, lavanda) y **"anochecer"** en oscuro.
- **Luces** (`efectos.js`): foco y borde iluminado que siguen al mouse dentro de los cuadros
  (variables `--mx/--my`, `mask-composite`) y un punto de luz global pequeño (naranja en claro,
  morado en oscuro) con `position: fixed`, `transform` y `requestAnimationFrame`. En oscuro toda la
  iluminación es morada.
- Sombras en capas, animaciones con `@keyframes`, y todo se apaga con `prefers-reduced-motion`.

**Pendientes:**
- La tabla sigue con **RLS disabled**: cualquiera con la anon key (está en GitHub) puede borrar.
- "Teclado Mecánico RGB" está **duplicado** (ids 4 y 5).
- `#notificación` sigue con tilde en el `id`.
- Repasar **scope** (dónde se declaran funciones y variables).
- Resuelto: `id` sí es autoincremental (los insert funcionan) y `buscarProductoPorId` ya se usa.

**Cierre de sesión:** no tuve una reflexión propia hoy; este resumen lo escribió el agente a mi pedido.

## 2026-10-30

Empecé el **login de clientes** con Supabase Auth: `cliente.html` (registro + inicio de sesión) y
una pantalla nueva, `bienvenida.html`, donde el cliente edita sus propios datos.

**Auth:**
- `signUp()` crea el usuario en `auth.users`; después se inserta el perfil en
  `clientes_practica` con **el mismo `id`** (`data.user.id`).
- `signInWithPassword()` guarda la sesión en el navegador, así que sigue viva al cambiar de
  página; `getUser()` la vuelve a leer y `signOut()` la borra.
- Al iniciar sesión se redirige con `location.href`. Los redirects automáticos (ya tengo sesión →
  bienvenida; no tengo sesión → login) usan `location.replace()`, que no deja la página en el
  historial y evita el rebote con el botón "atrás".

**UPDATE del perfil:**
- Tres pasos: **leer** (`select(...).eq('id', user.id).single()`), **mostrar**
  (`input.value = ...`) y **actualizar** (`update({...}).eq('id', user.id).select()`).
- Se editan `nombre`, `telefono` y `direccion`. `correo` y `rol` quedan `readonly`: el correo
  también vive en Auth (cambiarlo solo en la tabla los desincroniza) y el rol no lo debe cambiar
  el propio cliente.
- Columnas nuevas `telefono` y `direccion` como `text` (un teléfono no es un número para
  operar). `?? ''` evita que un `null` aparezca como el texto "null" en el input.
- **RLS no avisa cuando bloquea:** un update bloqueado no da error, devuelve `data = []`. Por
  eso se revisa `data.length === 0`. Políticas con `auth.uid() = id` para leer y editar solo la
  propia fila.

**Diseño:**
- `css/cliente.css`: paleta **lila / morado** con variables CSS y modo oscuro automático
  (`prefers-color-scheme`).
- El formulario de edición está en un **`<aside>` lateral**: siempre existe en el HTML; la
  clase `.abierto` lo mueve de `translateX(100%)` a `0` y la `transition` lo anima. Se cierra
  con ✕, clic en el fondo o `Esc`. `visibility: hidden` evita que Tab entre a campos ocultos.

**Pendientes:**
- Correr en Supabase el SQL de las columnas `telefono`/`direccion` y de las políticas RLS de
  `clientes_practica`, si todavía no se corrió.
- Probar en el navegador el flujo completo: registro → login → editar → cerrar sesión.
- Siguen los pendientes del 2026-10-29 (RLS de `productos_practica`, duplicado, `#notificación`,
  repasar scope).

**Cierre de sesión:** reflexión propia pendiente.

## 2026-11-05

Hice `git pull` (llegaron `bienvenida.html` y `cliente.html`) y pasé la edición del perfil a
**`cliente.html`**, con una **sidebar estática**.

**Sidebar de perfil:**
- Siempre visible a la derecha (`position: sticky`). En celular (< 800px) baja debajo del
  contenido.
- Sin sesión, los campos quedan dentro de un **`<fieldset disabled>`**: con una sola propiedad se
  bloquean todos los `input` y `button` de adentro.
- Al iniciar sesión ya no se redirige a `bienvenida.html`: `cargarPerfil()` llena los datos y
  desbloquea la sidebar. `revisarSesionActiva()` hace lo mismo al recargar la página.
- Con sesión, los formularios de registro/login se cambian por la tarjeta **"¡Hola, nombre!"**,
  y el saludo se actualiza cuando se guarda un nombre nuevo.
- `bienvenida.html` sigue en el repo, pero ya no se usa.

**Bugs encontrados:**
- `cliente.js` le ponía un listener a un `#btn-logout` que no existía y llamaba a
  `mostrarEstadoSesion()`, que no estaba definida → `TypeError` al cargar la página.
- **`hidden` no funciona si el CSS le pone `display: grid/flex` al elemento.** Se arregló con
  `[hidden] { display: none !important; }`.

**RLS / seguridad:**
- La policy `ver_productos` (`to authenticated using (true)`) deja ver **todo** a cualquiera
  con sesión. Además, la sesión se comparte entre todas las páginas del mismo origen
  (`localStorage`).
- Las policies *permissive* se combinan con OR: basta con que una deje pasar la fila.
- La `anon key` es pública a propósito (se ve en Network → Headers y en Sources); la seguridad
  real es RLS. La `service_role` nunca va en el frontend.
- `clientes_practica` **todavía no tiene RLS**: con la anon key, cualquiera podría leer los
  datos con la consola o con `curl.exe`.

**Pendientes:**
- Observar la vulnerabilidad de `clientes_practica` (inspector, consola, `curl.exe`) y después
  activar RLS con las policies `ver_mi_perfil`, `editar_mi_perfil` y `crear_mi_perfil`, más
  `grant update (nombre, telefono, direccion)` para que nadie se cambie el `rol`.
- Revisar si la confirmación de correo hace que el `insert` del registro falle con RLS (si
  pasa → trigger en `auth.users`).
- Probar en el navegador el flujo completo de la sidebar.

**Cierre de sesión:** sin reflexión propia hoy.

## 2026-11-06

Hice `git pull`, renombré la página del CRUD, le puse login de administrador y empecé la
**galería de productos** del cliente.

**Renombre `prueba2` → `admin`:**
- `git mv` para `prueba2.html` → `admin.html` y `js/prueba2.js` → `js/admin.js`: Git lo guarda
  como **renombre** y el historial se conserva (`git log --follow supabase/js/admin.js`).
- Se actualizaron el `<script src>`, el `<title>` y los comentarios de `admin.html`,
  `styles.css` y `vistas.js`. Las entradas viejas de esta bitácora que dicen `prueba2` se
  dejaron como estaban (son historia); la equivalencia quedó anotada en `notas.md`.

**Login de administrador (`admin.html`):**
- El CRUD (`#panel-admin`) y el menú quedan **ocultos** hasta confirmar dos cosas: hay sesión
  (`db.auth.getUser()`) **y** existe la fila del usuario en `admins_practica`.
- `maybeSingle()` en vez de `single()`: si no hay fila devuelve `null` **sin error** ("no es
  admin"), y así no se confunde con una falla real.
- La llamada inicial a `mostrarEstadoSesionAdmin()` pasó al **final** del archivo: una `const`
  no se puede usar antes de su línea ("Cannot access before initialization"). Antes no fallaba
  solo porque el `await` hacía esperar a la función.
- Solo se ve la tarjeta de **Iniciar sesión**, con el enlace "¿No tienes cuenta? Regístrate"
  para cambiar a la de registro. Esos enlaces son `<button type="button">`: dentro de un
  `<form>`, un botón sin `type` funciona como `submit`.
- Los botones se desactivan mientras se espera a Supabase ("Entrando...") para evitar el doble
  envío.
- Aviso de sesión con forma de **pastilla** y tres tipos (`info` / `exito` / `error`, vía
  `data-tipo`). Para repetir la animación se quita la clase, se lee `offsetWidth` y se vuelve a
  poner.

**Galería del cliente (`galeria.html`, sin Supabase):**
- Un ejemplo de CodePen no se pudo analizar (CodePen bloquea la descarga automática con 403).
  Entre 3 propuestas se eligió el **escaparate por categorías**.
- Filas horizontales con `grid-auto-flow: column` + **`scroll-snap`**, flechas ‹ › (que se
  ocultan en pantallas táctiles), "Ver todo" convierte la fila en grilla, chips de categorías y
  buscador en vivo que ignora tildes (`normalize('NFD')`).
- Detalle en un **`<dialog>`** nativo (`showModal()`, Esc, foco atrapado) con selector de
  cantidad limitado al stock.
- Carrito lateral guardado en `localStorage` como `{ id, cantidad }` (el precio siempre se lee
  de los datos), con subtotal, "Ahorras" y total.
- Paleta lila de `cliente.css`, pero en su propio `galeria.css`, porque `cliente.css` le da
  estilo global a `form`, `button` y `h2`.
- **Bug de layout:** la página entera se desbordaba de lado. Un hijo de grid no se encoge por
  debajo de su contenido (`min-width: auto`) → se arregló con
  `grid-template-columns: minmax(0, 1fr)`.
- **`scroll` y `error` no burbujean**: para escucharlos con un solo listener se usa la fase de
  **captura** (`addEventListener(..., true)`).

**Pendientes:**
- Probar en el navegador el login del admin en los 3 casos (sin sesión, usuario sin perfil de
  admin, admin).
- **RLS de `productos_practica`**: ocultar el panel es solo visual; que solo los usuarios de
  `admins_practica` puedan escribir.
- Revisar si la confirmación de correo hace fallar el `insert` en `admins_practica`.
- Galería: agregar la columna `categoria` a `productos_practica`, cambiar las imágenes de
  relleno (picsum) por las reales y conectar con Supabase.

**Cierre de sesión:** reflexión propia pendiente.

## 2026-11-13

Error de RLS en Supabase, tienda del cliente con Supabase, análisis de la base de datos y
seguridad de pedidos.

**Error `42P01` en la policy "Admin actualiza cualquier pedido":**
- La tabla se llama `admins_practica` (con **s**), no `admin_practica`. Postgres llama
  *relation* a las tablas; `42P01` = "ese nombre de tabla no existe". Es el mismo concepto que
  un `ReferenceError` en JS.
- Más tarde salió otro `42P01` con `pedidos_practica`: la tabla ya se había renombrado a
  `pedidos` (estructura nueva). Ese nombre viejo lo puso el agente al ajustar el SQL.
- **Patrón:** ya van 5 errores por usar un nombre que no existe. Costumbre: copiar el nombre
  desde el Table Editor, sobre todo después de cambiar la estructura.

**`cliente.html` con el formato de la galería (con Supabase):**
- Mismo `galeria.css` + un `cuenta.css` nuevo (`cliente.css` se dejó para `bienvenida.html`).
- Productos reales de `productos_practica`, con mensajes de "cargando" y de error con
  "Reintentar". Sin columna `categoria`, todo cae en "Otros".
- Panel 👤 de cuenta: pestañas de iniciar sesión / crear cuenta, "Mis datos" y cerrar sesión.
- "Ir a pagar" es **simulado**: pide sesión y muestra un resumen con número de pedido, sin
  guardar nada ni descontar unidades.
- `escapeHtml()`: los datos de la base van a `innerHTML`, así que se convierten en texto.
- `galeria.html` se dejó igual (es el prototipo).

**Análisis de la base de datos** (`OUTPUT/analisis_base_datos_2026-11-13.md`):
- Críticos: la policy `agregar` de `admins_practica` deja que cualquiera se haga admin;
  `clientes_practica` no tenía RLS; `cliente_id` tenía default `gen_random_uuid()`; `id` sin
  `identity`.
- Diseño: un pedido con un solo producto → separar en cabecera + detalle, guardar el precio al
  comprar y un `check` para `estado`.

**RLS de `clientes_practica`** (`sql/rls_clientes_practica.sql`, ya aplicado):
- Cada cliente ve, crea y edita solo su fila; los admins ven todas; nadie borra.
- RLS filtra **filas**; los **permisos por columna** (`grant update (nombre, telefono,
  direccion)`) evitan que el cliente cambie su `rol` o `correo`.

**Pruebas de pedidos desde la consola:**
- Si RLS bloquea un `update` o un `delete`, **no hay error: llegan 0 filas**. Por eso siempre
  va `.select()` y se revisa `data.length`.
- Un string con comillas simples no puede partirse en dos líneas, y `//` comenta solo hasta el
  final de la línea.
- En `pedidos_practica` la columna es `direccion_envio`, no `direccion`.

**Estructura nueva:** `pedidos` (cabecera), `detalles_pedidos` (productos de cada pedido) e
`historial_estados_pedido`.
- `sql/indices_pedidos.sql`: índice único **parcial** (un solo carrito abierto por cliente) e
  índices en las FKs, que Postgres no crea solo.
- `sql/rls_pedidos.sql`: RLS + permisos por columna (el navegador no puede mandar
  `precio_unitario`). El cliente confirma con `confirmar_pedido()`, no con `update`. Se corrigió
  `admin_practica`, los comentarios partidos y la vista `pedidos_con_total` (todavía no existe).
  Se borran las policies viejas que venían de `pedidos_practica`.

**Pendientes:**
- Correr `sql/rls_pedidos.sql` y revisar con `pg_policies` qué quedó.
- **Borrar la policy `agregar` de `admins_practica`** (cualquiera puede hacerse admin).
- Crear `confirmar_pedido()` y la vista `pedidos_con_total` con `security_invoker = true`.
- Rehacer los scripts de consola para la estructura nueva (`pedidos` + `detalles_pedidos`).
- Correr `sql/add_categoria_productos.sql` y probar `cliente.html` en el navegador.
- Trigger en `auth.users` para crear el perfil cuando el registro exige confirmar el correo.

**🔴 Urgente (hacer primero en la próxima sesión):**
1. **Borrar la policy `agregar` de `admins_practica`**: hoy cualquier usuario con sesión puede
   insertarse como admin y controlar productos y pedidos.
   `drop policy "agregar" on public.admins_practica;` (los admins se crean desde el dashboard).
2. **Correr `sql/rls_pedidos.sql`**: hasta entonces `pedidos`, `detalles_pedidos` e
   `historial_estados_pedido` pueden tener las policies viejas o permisos de más. Revisar después
   con `pg_policies`.
3. **Crear `confirmar_pedido()`**: con la RLS nueva el cliente no tiene UPDATE, así que sin esta
   función no hay forma de confirmar un pedido.
4. **Crear `pedidos_con_total` con `security_invoker = true`**: si se crea como vista normal, se
   salta el RLS y cada cliente vería los pedidos de todos.

**Cierre de sesión:** no me costó nada.

## 2026-11-19 — Tienda RICCIO (e-commerce de marca propia)

**Qué se pidió a la IA:** convertir el e-commerce en *RICCIO*, una marca colombiana ficticia de
productos para cabello ondulado, rizado y crespo (solo marca propia, nada de Skala/Cantu/Garnier).
Paleta lavanda `#F2EAFB`, lila `#A98ACB`, morado `#69468D`, crema `#FFF9F2` y texto `#29232E`.
El catálogo tiene 20 productos en 6 categorías y 10 páginas: inicio, productos, categorías,
detalle, carrito, cuenta, checkout, pedidos, nosotros y admin. Hay filtros por nombre,
categoría, precio y necesidad capilar.

**Qué quedó** (carpeta nueva `riccio/`, sin tocar `supabase/`):
- `sql/01_tablas.sql`, `02_seguridad.sql`, `03_productos.sql`: tablas propias con prefijo `riccio_`,
  RLS desde el inicio y `riccio_crear_pedido()`. El navegador solo manda ids y cantidades;
  precios, inventario y total los calcula Postgres, que bloquea con `for update` para no
  vender dos veces la última unidad.
- Un trigger guarda el historial de estados y devuelve las unidades al cancelar un pedido.
  `entregado` y `cancelado` son estados finales.
- `disponible` es una columna **generada** (`activo and inventario > 0`): nunca se contradice.
- Los productos no se borran, se **desactivan** (`activo = false`), para no romper el historial de pedidos.
- `riccio_admins` no tiene política de INSERT: el error de `admins_practica` no se repite.
- 20 imágenes SVG generadas: misma silueta por categoría (frasco, tubo, dosificador, pote,
  gotero, spray) y etiqueta con el color secundario de cada producto.
- `index.html` es una sola página con vistas por `#hash` (mismo patrón de `vistas.js`), y
  `admin.html` maneja productos y pedidos.
- Estilos *mobile first*: los colores son variables CSS y el diseño se probó en Edge a 375 px, 820 px y 1366 px.

**Qué se probó y no quedó:**
- Modificar directamente `cliente.html`/`admin.html` → se descartó para no romper los ejercicios de clase.
- Escribir el SQL sobre `pedidos`/`detalles_pedidos` → se descartó porque sus columnas exactas no
  están en el repo; escribir SQL "a ciegas" podía romperlas.
- Primera versión de las imágenes: la línea "ACONDICIONADOR · 300 ml" no cabía en la etiqueta
  del tubo y el brillo lateral caía sobre las tapas → quedó solo la presentación y se quitó el brillo.
- En el checkout, el mensaje de error se borraba al refrescar el catálogo → ahora se guarda en
  una variable (`checkoutError`) y se vuelve a pintar.

**Pendiente:** correr los 3 SQL de `riccio/sql/` en orden y crear el admin (instrucciones al
final de `02_seguridad.sql`). Siguen pendientes los urgentes del 2026-11-13 en las tablas de práctica.

**Fotos reales, lote 1 (10 de 20):** la estudiante pasó las fotos de champús, acondicionadores y
cremas (envases lila con el logo RICCIO de ondas).
- **Qué quedó:** se convirtieron de PNG (~2 MB cada una) a JPG de 800×800 (~45 KB) en
  `riccio/img/<producto>.jpg`. Se actualizaron `03_productos.sql` y el banner del inicio, y se
  creó `04_fotos_productos.sql` para actualizar las filas si el 03 ya se había corrido.
- La presentación se ajustó a lo que dicen las fotos: champús y acondicionadores pasan a 500 ml
  y cremas a 300 ml (antes 300 y 250).
- **Qué se probó y no quedó:** los 10 SVG generados para esos productos se borraron. Los otros
  10 siguen en SVG hasta que lleguen sus fotos.

**Corrección (mismo día) — se entendió mal el pedido:** la estudiante quería que su proyecto
`supabase/` (galería, cliente, admin) pasara a ser RICCIO **cambiando solo el contenido**, no un
sistema nuevo con otras tablas.
- **Qué se probó y no quedó:** toda la carpeta `riccio/` (tablas `riccio_*`, `riccio_crear_pedido()`,
  la tienda de una sola página y su admin) se borró. Lo único que se rescató fueron las imágenes.
- **Qué quedó:**
  - `sql/riccio_productos.sql`: borra los productos viejos de `productos_practica` (si alguno está
    en un pedido, lo deja como no disponible) e inserta los 20 de RICCIO con las mismas columnas de
    siempre. Presentación y necesidades van en `caracteristicas`; beneficios y modo de uso, dentro de `descripción`.
  - `galeria.js`: el arreglo `PRODUCTS` ahora tiene los 20 productos de RICCIO.
  - `galeria.css` y `styles.css`: solo se cambiaron los valores de las variables de `:root`
    (paleta RICCIO en claro y oscuro), con Playfair Display en títulos y Poppins en textos.
  - `galeria.html`, `cliente.html` y `admin.html`: logo **RICCIO**, eslogan y títulos nuevos.
  - Fotos en `supabase/img/` (10 reales y 10 dibujos temporales en SVG).
- **Aprendizaje para el agente:** ante "lo que sea mejor", confirmar el *alcance* (¿contenido o
  sistema?) antes de construir algo grande.
**`cliente.html` no mostraba lo de la galería:** al consultar Supabase se vio que
`productos_practica` seguía con los 7 productos viejos y sin la columna `categoria`: el SQL de
RICCIO todavía no se había corrido. `galeria.html` lee un arreglo en el JS y `cliente.html` lee la
base de datos, por eso no coincidían. Se ajustó `riccio_productos.sql` (el `insert` va directo en
un `do $$ ... $$`) para que funcione aunque `caracteristicas` sea `json` o `jsonb`.
- Se corrió `riccio_productos.sql`: en Supabase quedaron los 20 productos de RICCIO (ids 12–31)
  en 6 categorías y se borraron los 7 viejos (ninguno estaba en un pedido). Ahora `cliente.html`
  y `galeria.html` muestran el mismo catálogo.

**Fotos reales, lote 2 (18 fotos, 3 por producto):** Strong Hold, Flexible Gel, Curl Mousse,
Hydra Mask, Repair Mask y Nutri Curls. No llegaron las de Shine Drops, Scalp Oil, Curl Refresh ni Night Repair.
- **Qué quedó:** la primera foto de cada producto reemplaza su dibujo. Las otras dos se volvieron
  productos nuevos (12 en total) con apellido según el envase o la versión (Tubo, Sin Residuo,
  Dosificador, Sin Rigidez, Soft, Minimal, Intensa, Aqua, Cream, Rose, Leaf, Gold) y precio según
  el formato o la fórmula. `galeria.js` pasó a 32 productos y se creó `sql/riccio_fotos_lote2.sql`
  (6 `update` + 12 `insert`, sin tocar tablas).
- La presentación se ajustó a las fotos: geles 250 ml, espumas 200 ml, mascarillas 350 ml.
- Las fotos se normalizaron a 800×800 sin recortar el envase (las tarjetas son 4:5 con `cover`):
  el borde se rellena estirando el color del borde de la foto.
- **Qué se probó y no quedó:** (1) rellenar con un solo color dejaba franjas visibles porque el
  fondo es un degradado; (2) `DrawImage` con recorte y `Clone` de 1 px metían pedazos del frasco
  en el borde. La causa real era que en PowerShell `$W` y `$w` son **la misma variable**: las
  variables no distinguen mayúsculas de minúsculas. Se arregló con nombres distintos (`$srcW`, `$dw`).

**Nueva estética de `cliente.html` (tomando como referencia la estructura de la tienda de Leche Pal Pelo):**
- **Qué se pidió:** colores originales de RICCIO, marca grande y centrada en el encabezado,
  filtros en un menú desplegable que se puedan combinar, login obligatorio, inicio estilo
  la tienda de referencia pero con las mismas tarjetas, hover en las tarjetas y estrellitas que
  siguen al mouse. Se eligió aplicarlo solo a `cliente.html` (opción A).
- **Qué quedó:**
  - Se quitó el modo oscuro automático: si el computador estaba en modo oscuro, la tienda salía
    morado oscuro y no se veía la paleta RICCIO.
  - `css/tienda.css` (nuevo): franja de anuncio, encabezado en grid de 3 columnas
    (`1fr auto 1fr`, para que RICCIO quede exactamente al centro), banner, "Nuestra colección",
    barra con **Filtrar ▾** y **Ordenar por**, y una cuadrícula de 2, 3 o 4 columnas en vez de filas deslizables.
  - Filtros: categoría, necesidad capilar, precio, "solo en oferta" y "ocultar agotados".
    Dentro de un grupo basta cumplir una opción; entre grupos hay que cumplirlos todos. Muestran
    chips con ✕, un contador y el botón "Ver N resultados".
  - Login obligatorio: sin sesión solo se ve la pantalla de acceso, y los productos se cargan
    después de entrar. Es solo visual: los datos los sigue protegiendo RLS.
  - `js/estrellas.js` (nuevo): estrellitas ✦ que siguen al mouse. No aparecen en celulares
    ni si el sistema pide reducir movimiento.
  - Hover: la tarjeta sube 8 px, gana borde lila, sombra y zoom en la foto.
- **Pendiente:** correr `riccio_fotos_lote2.sql`. Mientras tanto, 6 productos apuntan a los `.svg`
  que ya se borraron y salen sin imagen.
- Se verificó en Supabase: `riccio_fotos_lote2.sql` ya se corrió (32 productos). Solo faltan fotos
  reales de 4 productos de Aceites y tratamientos (siguen con el dibujo SVG temporal).
- **Fotos reales, lote 3:** Shine Drops, Scalp Oil, Night Repair y Curl Refresh. Se convirtieron
  a JPG 800×800 (~40 KB), se actualizó `galeria.js` y se creó `sql/riccio_fotos_lote3.sql` (4 `update`).
  Los 4 `.svg` se dejan hasta correr el SQL, para que la página no quede sin imagen mientras tanto.
- Se corrió `riccio_fotos_lote3.sql`: los 32 productos de Supabase tienen foto JPG. Se borraron los 4 `.svg` temporales; ya no queda ningún dibujo.

**Cierre de la sesión:**
- La tienda RICCIO quedó lista en `supabase/`: 32 productos con foto real, las mismas tablas de antes,
  `cliente.html` con login obligatorio, filtros desplegables, hover y estrellitas.
- Se hizo commit y push de todo el trabajo de hoy.
- **Pendientes que siguen de antes:** policy `agregar` en `admins_practica`, `rls_pedidos.sql`,
  `confirmar_pedido()` y `pedidos_con_total`.
- **Reflexión del estudiante:** "Aprendí a usar filtros combinados y que PowerShell no distingue mayúsculas."

**Segunda parte: pedidos reales con Supabase, panel de pedidos y sesiones separadas**
- **SQL adaptado a mi proyecto e instalado en Supabase:** `precio_unitario_detalles.sql` (un trigger
  copia el precio, el navegador nunca lo envía), `estados_pedidos.sql` (solo se permiten ciertas
  transiciones de estado y cada cambio queda en `historial_estados_pedido`), `confirmar_pedido.sql`
  (función atómica: valida, descuenta stock, fija precios y confirma) y `pedidos_con_total.sql`
  (vista con `security_invoker`: el total lo calcula la BD).
- **Esquema real documentado:** `extraer_esquema.sql` saca la estructura completa en un JSON y
  `sql/ESQUEMA.md` la resume. Hay que consultarla antes de escribir SQL o consultas en JS.
- **Carrito conectado a Supabase (8 pasos de la guía, adaptados a `cliente.js`):** agregar
  (insert/update en `detalles_pedidos`), feedback ✓/Error en el botón, quitar (delete), `+`/`−`
  (update con la cantidad total: idempotente), el carrito sobrevive a la recarga (select anidado),
  formulario de envío y confirmar con `rpc('confirmar_pedido')`. Se quitó `localStorage`: la BD es
  la única fuente del carrito. Se verificó en Network y en la BD que funciona.
- **Mis pedidos (cliente)** y **Pedidos + Clientes (admin):** el admin cambia el estado con
  botones (solo los permitidos; el trigger es quien valida). Los datos que escribe el cliente se
  escapan (`escapeHtml`) para evitar XSS en el panel.
- **Estilo:** `admin.html` ahora se ve como la tienda (`css/admin-riccio.css`), solo en claro y
  sin efectos de luz. En `cliente.html` los paneles laterales pasaron a ser páginas con `#hash`
  (`#carrito`, `#cuenta`, `#pedidos`), y "📦 Mis pedidos" quedó visible en el encabezado.
- **Sesiones separadas:** `supabaseClient.js` usa un `storageKey` distinto según
  `data-session` ("admin" o "cliente"). Iniciar sesión en una página ya no cambia la otra.
- **Conceptos clave:** GRANT (qué operación) + RLS (qué filas) son dos capas distintas; RLS
  bloquea un update/delete sin dar error (llegan 0 filas: por eso se pide `.select()`);
  primero se confirma en la BD y después se actualiza la pantalla.
- **Pendientes:**
  - Correr `sql/permisos_productos.sql` (quita a `anon` los permisos de escritura y `TRUNCATE` en productos).
  - La policy `agregar` de `admins_practica` sigue dejando que cualquiera se registre como admin.
    Por ahora se decidió dejarla, pero contradice la regla "solo el admin elimina productos".
  - Cancelar un pedido no devuelve el stock (falta un trigger).
  - El registro de cliente no crea el perfil si Supabase pide confirmar el correo.
- **Reflexión del estudiante (segunda parte):** "Aprendí a conectar el carrito con Supabase usando RLS y triggers."
