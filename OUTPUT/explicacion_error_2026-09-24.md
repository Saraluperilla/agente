# Explicación de error — 2026-09-24

**Error:** `Uncaught ReferenceError: animales is not defined` (Console de Chrome, `VM71:1`)

## Tipo de error
**ReferenceError**: JavaScript busca un nombre (variable o función) en todos los scopes disponibles y no lo encuentra.

## Causa en este caso
El código no tenía errores: `data.js` declara `let animales` en la línea 1, y `gestion.html` carga `data.js` → `credenciales.js` → `gestion.js`.

El problema era **dónde** se escribió el código:
- La Console ejecuta código **en la página de la pestaña actual**.
- Si la pestaña tiene abierto `credenciales.js` directamente (paso "ver el archivo por su URL"), esa "página" es solo un texto: no carga `data.js`, así que `animales` no existe ahí.
- `VM71` y `<anonymous>:1:1` confirman que el error viene de lo escrito en la consola, no de un archivo del proyecto.

## Cómo comprobarlo
1. Mirar la barra de direcciones: debe terminar en `gestion.html`.
2. En la Console, el selector de contexto (arriba a la izquierda) debe decir `top`.
3. Escribir `typeof animales`: `"object"` = existe; `"undefined"` = pestaña/contexto equivocado.

## Solución
Volver a `gestion.html` (o `index.html`, que también carga `data.js`) y ejecutar ahí el código:

```js
typeof animales;        // "object"
console.table(animales);
```

## Concepto
Una variable solo existe en el entorno (página/pestaña) que cargó el script que la declara. Mismo principio que el error del 2026-09-18: cada página tiene su propia memoria.
