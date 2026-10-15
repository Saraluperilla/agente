// 3° script: todas las consultas a la tabla "animales".
// Solo habla con Supabase; no toca el HTML (eso es trabajo de gestion.js).
// Cada función es async porque la respuesta llega por red: hay que esperarla con await.
// Supabase no lanza excepciones: devuelve { data, error }. Por eso revisamos error
// y lo lanzamos (throw) para que gestion.js lo atrape con try/catch.

const TABLA = "animales";

const leerAnimales = async () => {
  const { data, error } = await supabaseClient
    .from(TABLA)
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
};

const filtrarPorHabitat = async (habitat) => {
  const { data, error } = await supabaseClient
    .from(TABLA)
    .select("*")
    .eq("habitat", habitat)
    .order("id", { ascending: true });
  if (error) throw error;
  return data;
};

const crearAnimal = async (animal) => {
  const { data, error } = await supabaseClient
    .from(TABLA)
    .insert(animal)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const actualizarAnimal = async (id, cambios) => {
  const { data, error } = await supabaseClient
    .from(TABLA)
    .update(cambios)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const eliminarAnimal = async (id) => {
  const { error } = await supabaseClient
    .from(TABLA)
    .delete()
    .eq("id", id);
  if (error) throw error;
};
