# Explicación de error — 2026-11-13

**Error:** `ERROR: 42P01: relation "admin_practica" does not exist`
**Dónde:** policy RLS `"Admin actualiza cualquier pedido"` en `public.pedidos_practica` (Supabase).

## Tipo de error
Referencia / nombre no definido (en SQL). Postgres llama *relation* a tablas y vistas; `42P01` = "usaste un nombre de tabla que no existe".

## Causa
En `using (...)` y `with check (...)` se escribió `admin_practica`, pero la tabla real es
**`admins_practica`** (con **s**), como se usa en `supabase/js/admin.js:121`.

## Corrección
```sql
create policy "Admin actualiza cualquier pedido"
on "public"."pedidos_practica"
as permissive
for update
to authenticated
using (
  exists (select 1 from public.admins_practica where id = (select auth.uid()))
) with check (
  exists (select 1 from public.admins_practica where id = (select auth.uid()))
);
```

## Concepto
- Postgres no "adivina" nombres parecidos: si el nombre no coincide letra por letra, la tabla no existe para él.
- Escribir el esquema (`public.`) evita otro caso del mismo error: que la tabla exista pero Postgres la busque en otro esquema.
- Es el mismo concepto que `ReferenceError` en JS: usar un nombre que no fue declarado así.
