# Explicación — 2026-09-18

## Lo que pasó
Al agregar un animal con el formulario de `gestion.html`, aparece en la tabla de esa misma página,
pero no aparece en el carrusel de `index.html`. No hay ningún error en consola.

## Tipo de problema
No es un error de sintaxis ni un `ReferenceError` — es un error de **lógica sobre el ciclo de vida
de los datos**: se asume que el arreglo `animales` es un solo lugar compartido, cuando en realidad
cada página tiene su propia copia en memoria.

## Por qué pasa
`index.html` y `gestion.html` son dos documentos HTML distintos. Cada uno, al abrirse en el
navegador, carga `data.js` **desde cero** y ejecuta `let animales = [...]` de nuevo, creando su
propia copia del arreglo en la memoria de esa pestaña. Cuando `gestion.js` hace
`animales.push(nuevoAnimal)`, solo modifica la copia que vive en la pestaña de `gestion.html` — el
archivo `data.js` en disco nunca cambia, y la pestaña de `index.html` (que ya cargó su copia antes,
o la carga de nuevo si la abres después) no se entera de ese cambio.

Es el mismo concepto que explica por qué recargar `gestion.html` también "borra" el animal
agregado: la copia en memoria desaparece, y al volver a cargar la página se parte otra vez del
arreglo original de `data.js`.

## La idea clave
Una variable de JavaScript vive **mientras la página está abierta**, nada más. No hay conexión
automática entre pestañas ni entre archivos: cada `<script>` que carga una página arranca su propio
espacio de memoria.

## Cómo se resuelve (si se quiere que persista)
Para que un animal agregado en `gestion.html` aparezca en `index.html` hace falta guardar los datos
en algún lugar que sobreviva al cambio de página — por ejemplo `localStorage` del navegador (ambas
páginas leerían de ahí en vez de solo del arreglo en memoria) o un backend con base de datos. Ninguna
de las dos existe todavía en este proyecto; es un paso aparte, no un bug que corregir en el código
actual.
