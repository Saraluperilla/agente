# Error explicado — 2026-10-16

**Error:** `404 Not Found` — `PGRST205: Could not find the table 'public.productos_practica' in the schema cache`
**Dónde:** consola de `supabase/prueba.html`, al correr `db.from('productos_practica').select('*')`

## Tipo de error
Referencia a un recurso que el servidor no encuentra en la ruta pedida (equivalente en base de datos a un `ReferenceError`).

## Causa
- La tabla `productos_practica` sí existía en Supabase.
- `SUPABASE_URL` en `js/supabaseClient.js` traía `/rest/v1/` al final.
- `supabase-js` ya agrega `/rest/v1/` solo → la ruta quedaba duplicada y el servidor no encontraba la tabla.

## Solución
```js
const SUPABASE_URL = "https://qrinfksxfgmafxcjmqcg.supabase.co"; // solo la URL base
```

## Concepto
`createClient` espera la **URL base del proyecto** (Project Settings → API → Project URL). La librería arma las rutas (`/rest/v1`, `/auth/v1`, `/storage/v1`) por su cuenta.
