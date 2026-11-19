# Esquema real de Supabase (proyecto RICCIO)

Extraído con `extraer_esquema.sql` el 2026-11-19. Si cambias tablas en Supabase,
vuelve a correr ese archivo y actualiza esta hoja.

Todo vive en el esquema `public`. Estados de pedido: `carrito`, `confirmado`,
`enviado`, `entregado`, `cancelado` (check `pedidos_estado_check`, son `text`, no enum).

## Tablas y columnas

| Tabla | Columnas (tipo) | Llaves / restricciones |
|---|---|---|
| `admins_practica` | `id` uuid (default `auth.uid()`), `created_at`, `nombre` text, `correo` text, `rol` text (default `'admin'`) | PK `id` |
| `clientes_practica` | `id` uuid (default `auth.uid()`), `created_at`, `nombre`, `correo`, `telefono`, `direccion`, `rol` (todas text) | PK `id` |
| `productos_practica` | `id` bigint, `nombre` text, `"descripción"` text (**con tilde: va entre comillas**), `precio` bigint, `unidades` bigint, `descuento` double precision (fracción: 0.15 = 15 %), `disponible` boolean, `caracteristicas` json, `img_url` text, `categoria` text | PK `id` |
| `pedidos` | `id` bigint, `created_at`, `cliente_id` uuid, `estado` text (default `'carrito'`), `envio` boolean (default false), `direccion` text, `telefono` text, `observacion` text, `confirmado_en` timestamptz | PK `id` · FK `cliente_id → clientes_practica(id)` ON DELETE RESTRICT · unique parcial `pedidos_un_carrito_por_cliente` (1 carrito por cliente) |
| `detalles_pedidos` | `id` bigint, `created_at`, `pedido_id` bigint, `producto_id` bigint, `cantidad` bigint (> 0), `precio_unitario` bigint (>= 0) | FK `pedido_id → pedidos` ON DELETE CASCADE · FK `producto_id → productos_practica` ON DELETE RESTRICT · unique `(pedido_id, producto_id)` |
| `historial_estados_pedido` | `id` bigint, `pedido_id` bigint, `estado_anterior` text, `estado_nuevo` text, `cambiado_por` uuid, `cambiado_en` timestamptz (default now()) | FK `pedido_id → pedidos` ON DELETE CASCADE |

Vista: `pedidos_con_total` (`security_invoker=true`) = columnas de `pedidos` + `total` bigint + `productos` integer.

## Funciones y triggers (ya instalados)

| Objeto | Archivo |
|---|---|
| `fijar_precio_unitario()` + trigger `detalles_pedidos_fijar_precio` (before insert) | `precio_unitario_detalles.sql` |
| `validar_transicion_estado()` + trigger `pedidos_validar_transicion` | `estados_pedidos.sql` |
| `registrar_cambio_estado()` (security definer) + triggers `pedidos_historial_alta`, `pedidos_historial_cambio` | `estados_pedidos.sql` |
| `confirmar_pedido(p_pedido_id, p_envio, p_direccion, p_telefono, p_observacion)` (security definer, solo `authenticated`) | `confirmar_pedido.sql` |

## Políticas RLS (todas `to authenticated` salvo indicación)

| Tabla | Política | Qué permite |
|---|---|---|
| `admins_practica` | `agregar` (INSERT) | `auth.uid() = id` — **cualquier usuario puede volverse admin** (ver pendientes) |
| `admins_practica` | `ver_perfil` (SELECT) | solo su fila |
| `clientes_practica` | `crear_mi_perfil`, `ver_mi_perfil`, `editar_mi_perfil`, `admin_ve_clientes` | su fila; admin ve todas |
| `productos_practica` | `ver_productos` (SELECT, **anon + authenticated**) | todos |
| `productos_practica` | `crea_productos`, `edita_productos`, `elimina_productos` | solo admins |
| `pedidos` | `ver_pedidos`, `crear_carrito`, `vaciar_carrito`, `admin_actualiza_estado` | ver `rls_pedidos.sql` |
| `detalles_pedidos` | `ver_detalles`, `agregar_detalle`, `cambiar_cantidad`, `quitar_detalle` | solo en pedidos propios en `carrito` |
| `historial_estados_pedido` | `ver_historial_admin` | solo admins |

Permisos por columna: `clientes_practica` UPDATE (`nombre`, `telefono`, `direccion`) ·
`pedidos` INSERT (`cliente_id`), UPDATE (`estado`) · `detalles_pedidos` INSERT
(`pedido_id`, `producto_id`, `cantidad`), UPDATE (`cantidad`).

## Pendientes detectados (2026-11-19)

1. `admins_practica`: la política `agregar` deja que cualquier cuenta se registre como admin.
2. `admins_practica` y `productos_practica`: `anon` conserva permisos completos de tabla
   (INSERT/UPDATE/DELETE/TRUNCATE). RLS los frena, pero conviene revocarlos.
3. `pedidos.cliente_id` exige fila en `clientes_practica`: si el registro no creó el
   perfil (bug de `cliente.js` con confirmación de correo), ese cliente no puede crear carrito.
