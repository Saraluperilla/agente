-- Pegar en Supabase > SQL Editor > Run.
-- Crea la tabla "animales" con las mismas columnas que data.js de proyectos1.
-- Ojo: en Postgres los nombres sin comillas se pasan a minúsculas,
-- por eso pesoKg pasa a llamarse peso_kg.

create table if not exists animales (
  id           bigint generated always as identity primary key,
  nombre       text    not null,
  imagen       text,
  descripcion  text,
  habitat      text    not null,
  alimentacion text,
  peso_kg      numeric,
  peligroso    boolean default false,
  habilidades  text[]  default '{}',
  created_at   timestamptz default now()
);

-- RLS (Row Level Security): Supabase bloquea todo si está activo y no hay políticas.
-- Estas políticas dejan que CUALQUIERA (rol anon) lea y escriba.
-- Sirve para aprender; antes de publicar hay que cambiarlas por políticas con login.
alter table animales enable row level security;

create policy "anon puede leer"      on animales for select to anon using (true);
create policy "anon puede insertar"  on animales for insert to anon with check (true);
create policy "anon puede editar"    on animales for update to anon using (true) with check (true);
create policy "anon puede eliminar"  on animales for delete to anon using (true);

-- Datos de ejemplo
insert into animales (nombre, imagen, descripcion, habitat, alimentacion, peso_kg, peligroso, habilidades) values
  ('León',
   'https://content.nationalgeographic.com.es/medio/2024/08/09/leon-masai-mara-kenia-antonio_28569739_240809155946_800x800.jpg',
   'El león es el único felino que vive en manada, llamada orgullo.',
   'Sabana', 'Carnívoro', 190, true, array['Cazar', 'Correr', 'Rugir']),
  ('Elefante',
   'https://content.nationalgeographic.com.es/medio/2026/08/13/1-elefante_819f7e8a_260813151716_800x800.webp',
   'El elefante es el mamífero terrestre más grande del mundo.',
   'Sabana', 'Herbívoro', 5500, false, array['Nadar', 'Usar la trompa', 'Cargar peso']),
  ('Tigre',
   'https://content.nationalgeographic.com.es/medio/2024/04/12/tigre-sumatra-en-libertad_00000000_ef50936c_240412092732_800x800.jpg',
   'El tigre es el felino más grande del mundo y un cazador solitario.',
   'Selva', 'Carnívoro', 220, true, array['Cazar', 'Nadar', 'Acechar']);
