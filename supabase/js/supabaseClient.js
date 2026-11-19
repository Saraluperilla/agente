
// 2° script: crea la conexión con Supabase.
// Los datos salen de Supabase > Project Settings > API.
// La anon key es pública (va en el navegador); la protección real la dan las políticas RLS.
const SUPABASE_URL = "https://qrinfksxfgmafxcjmqcg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyaW5ma3N4ZmdtYWZ4Y2ptcWNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwODg1NTMsImV4cCI6MjEwNzY2NDU1M30.Ndlouxhvz4SZRQcabu1-XtxlgEBtKmPNl1a7WC0XvPg";

// El CDN (1° script) deja la librería en window.supabase.
// No llamamos a esta constante "supabase" para no tapar ese nombre global:
// const supabase = supabase.createClient(...) daría ReferenceError.
// ZONA DE SESIÓN: cada página dice a qué zona pertenece con un atributo en su
// <script>, p. ej. <script src="js/supabaseClient.js" data-session="admin">.
// Supabase guarda la sesión en localStorage con UNA llave; si todas las páginas
// usan la misma, iniciar sesión en admin.html también "inicia" en cliente.html.
// Con una llave por zona, cada una tiene su propia sesión y no se mezclan.
//   data-session="admin"   -> llave "riccio-auth-admin"   (admin.html)
//   data-session="cliente" -> llave "riccio-auth-cliente" (cliente.html, bienvenida.html)
//   sin atributo           -> llave por defecto de Supabase (index.html, prueba.html)
// document.currentScript = la etiqueta <script> que se está ejecutando ahora mismo.
const SESSION_ZONE = document.currentScript?.dataset.session;

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SESSION_ZONE ? { auth: { storageKey: `riccio-auth-${SESSION_ZONE}` } } : undefined,
);

// Alias "db" para seguir la guía (sección 4.3). Es el mismo client, con otro nombre.
const db = supabaseClient;
