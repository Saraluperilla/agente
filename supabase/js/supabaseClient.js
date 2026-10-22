
// 2° script: crea la conexión con Supabase.
// Los datos salen de Supabase > Project Settings > API.
// La anon key es pública (va en el navegador); la protección real la dan las políticas RLS.
const SUPABASE_URL = "https://qrinfksxfgmafxcjmqcg.supabase.co"; // Solo la Project URL: createClient agrega /rest/v1/ por su cuenta
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaW5ma3N4ZmdtYWZ4Y2ptcWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODg1NTMsImV4cCI6MjEwNzY2NDU1M30.Ndlouxhvz4SZRQcabu1-XtxlgEBtKmPNl1a7WC0XvPg";

// El CDN (1° script) deja la librería en window.supabase.
// No llamamos a esta constante "supabase" para no tapar ese nombre global:
// const supabase = supabase.createClient(...) daría ReferenceError.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Alias "db" para seguir la guía (sección 4.3). Es el mismo client, con otro nombre.
const db = supabaseClient;
