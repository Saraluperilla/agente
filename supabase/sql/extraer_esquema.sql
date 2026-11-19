-- ============================================================
-- Extrae la ESTRUCTURA completa del esquema public en un solo JSON.
-- Solo lectura: no cambia nada y NO incluye filas (ni clientes, ni pedidos).
--
-- Uso: Supabase > SQL Editor > pegar > Run.
-- Sale una sola celda "esquema": cópiala completa y guárdala en
-- supabase/sql/esquema_actual.json (o pégala en el chat).
-- ============================================================

select jsonb_pretty(jsonb_build_object(

  -- Tablas y vistas, con RLS activado o no y opciones (security_invoker en vistas)
  'tablas', (
    select jsonb_agg(jsonb_build_object(
             'tabla',     c.relname,
             'tipo',      case c.relkind when 'r' then 'table' when 'v' then 'view' when 'm' then 'materialized view' end,
             'rls',       c.relrowsecurity,
             'opciones',  c.reloptions,
             'filas_aprox', c.reltuples::bigint
           ) order by c.relname)
      from pg_class c
     where c.relnamespace = 'public'::regnamespace
       and c.relkind in ('r', 'v', 'm')
  ),

  -- Columnas de cada tabla/vista
  'columnas', (
    select jsonb_agg(jsonb_build_object(
             'tabla',   table_name,
             'columna', column_name,
             'tipo',    data_type,
             'nulo',    is_nullable,
             'default', column_default
           ) order by table_name, ordinal_position)
      from information_schema.columns
     where table_schema = 'public'
  ),

  -- PK (p), FK (f), unique (u), check (c)
  'restricciones', (
    select jsonb_agg(jsonb_build_object(
             'tabla',  conrelid::regclass::text,
             'nombre', conname,
             'tipo',   contype,
             'def',    pg_get_constraintdef(oid)
           ) order by conrelid::regclass::text, contype, conname)
      from pg_constraint
     where connamespace = 'public'::regnamespace
       and conrelid <> 0
  ),

  'indices', (
    select jsonb_agg(jsonb_build_object(
             'tabla',  tablename,
             'indice', indexname,
             'def',    indexdef
           ) order by tablename, indexname)
      from pg_indexes
     where schemaname = 'public'
  ),

  -- Políticas RLS
  'politicas', (
    select jsonb_agg(jsonb_build_object(
             'tabla',      tablename,
             'politica',   policyname,
             'cmd',        cmd,
             'roles',      roles,
             'permissive', permissive,
             'using',      qual,
             'with_check', with_check
           ) order by tablename, cmd, policyname)
      from pg_policies
     where schemaname = 'public'
  ),

  -- Permisos de tabla completa para anon / authenticated
  'permisos_tabla', (
    select jsonb_agg(jsonb_build_object(
             'tabla',   table_name,
             'rol',     grantee,
             'permiso', privilege_type
           ) order by table_name, grantee, privilege_type)
      from information_schema.role_table_grants
     where table_schema = 'public'
       and grantee in ('anon', 'authenticated')
  ),

  -- Permisos POR COLUMNA (solo los que no vienen ya de un permiso de tabla completa)
  'permisos_columna', (
    select jsonb_agg(jsonb_build_object(
             'tabla',   cp.table_name,
             'columna', cp.column_name,
             'rol',     cp.grantee,
             'permiso', cp.privilege_type
           ) order by cp.table_name, cp.grantee, cp.privilege_type, cp.column_name)
      from information_schema.column_privileges cp
     where cp.table_schema = 'public'
       and cp.grantee in ('anon', 'authenticated')
       and not exists (
             select 1 from information_schema.role_table_grants g
              where g.table_schema   = 'public'
                and g.table_name     = cp.table_name
                and g.grantee        = cp.grantee
                and g.privilege_type = cp.privilege_type)
  ),

  -- Funciones propias (sin las de extensiones), con quién puede ejecutarlas
  'funciones', (
    select jsonb_agg(jsonb_build_object(
             'nombre',           p.proname,
             'argumentos',       pg_get_function_identity_arguments(p.oid),
             'security_definer', p.prosecdef,
             'anon_ejecuta',     has_function_privilege('anon', p.oid, 'execute'),
             'auth_ejecuta',     has_function_privilege('authenticated', p.oid, 'execute'),
             'definicion',       pg_get_functiondef(p.oid)
           ) order by p.proname)
      from pg_proc p
     where p.pronamespace = 'public'::regnamespace
       and p.prokind = 'f'
       and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e')
  ),

  'triggers', (
    select jsonb_agg(jsonb_build_object(
             'tabla',   c.relname,
             'trigger', t.tgname,
             'activo',  t.tgenabled <> 'D',
             'def',     pg_get_triggerdef(t.oid)
           ) order by c.relname, t.tgname)
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
     where c.relnamespace = 'public'::regnamespace
       and not t.tgisinternal
  ),

  'vistas', (
    select jsonb_agg(jsonb_build_object(
             'vista',      viewname,
             'definicion', definition
           ) order by viewname)
      from pg_views
     where schemaname = 'public'
  ),

  -- Tipos enum (por si estado es un enum y no un text)
  'enums', (
    select jsonb_agg(jsonb_build_object(
             'tipo',    t.typname,
             'valores', (select jsonb_agg(e.enumlabel order by e.enumsortorder)
                           from pg_enum e where e.enumtypid = t.oid)
           ) order by t.typname)
      from pg_type t
     where t.typnamespace = 'public'::regnamespace
       and t.typtype = 'e'
  ),

  -- Buckets de Storage (fotos de productos)
  'buckets', (
    select jsonb_agg(jsonb_build_object('bucket', id, 'publico', public) order by id)
      from storage.buckets
  )

)) as esquema;
