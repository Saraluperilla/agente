# Explicación de error — 2026-10-22

**Archivo:** `supabase/js/prueba2.js`
**Error:** `SyntaxError: Unexpected token ')'` (línea 107)

## Tipo de error
**Sintaxis:** el código está mal escrito, así que JavaScript no puede leerlo y **no ejecuta ni una línea** del archivo. Por eso tampoco funcionaba el botón "Traer productos", aunque su código estuviera bien.

## Causa
`addEventListener('click', async () => { ... })` abre dos cosas, y hay que cerrarlas en orden inverso:

```
addEventListener(  'click', async () => {   ...   }  );
                ^ abre (                ^ abre {  ^ cierra {  ^ cierra (
```

1. **Línea 1:** el listener de `btn-traer` se abría pero nunca se cerraba. Todo lo que venía después (`nuevoProducto`, `agregarProducto`, el segundo listener) quedaba *dentro* del primer clic.
2. **Línea 107:** el segundo listener se cerraba con `)}` (orden invertido) en vez de `});`.

## Corrección
```js
  document.getElementById('resultado4').innerHTML = ...;
}); // cierra el listener de 'btn-traer'

// ...

document.getElementById('btn-traer2').addEventListener('click', async () => {
  // ...
}); // } cierra la función, ) cierra addEventListener(
```

## Para no repetirlo
- Al escribir `addEventListener('click', async () => {`, escribe de inmediato el cierre `});` y luego rellena el medio.
- En VS Code, al poner el cursor sobre una `{`, se resalta su pareja: si no se resalta ninguna, falta cerrarla.
- `node --check archivo.js` en la terminal dice si hay errores de sintaxis sin abrir el navegador.
