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
