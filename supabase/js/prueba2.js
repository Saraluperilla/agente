document.getElementById('btn-traer').addEventListener('click', async () => {

  // "async" convierte esta función (el listener del clic) en una función
  // ASÍNCRONA: una función que PUEDE usar "await" adentro para esperar
  // algo que tarda, sin congelar el resto de la página mientras espera.
  //
  // Diferencia clave con localStorage (semana 7): localStorage.getItem()
  // y localStorage.setItem() son operaciones SINCRÓNICAS — ocurren al
  // instante, en tu propio computador, sin viajar a ningún lado. Por eso
  // nunca necesitaste "async"/"await" para leer o escribir en
  // localStorage. Una consulta a Supabase, en cambio, viaja por internet
  // hasta el servidor de Supabase y la respuesta tiene que volver — eso
  // toma un tiempo real (aunque sea poco), y JavaScript necesita una
  // forma explícita de decir "espera aquí a que llegue la respuesta".

  // "await" pausa la ejecución DE ESTA FUNCIÓN (no de toda la página)
  // hasta que la consulta a Supabase responda. Mientras tanto, el resto
  // de tu página sigue funcionando con normalidad — solo esta función
  // en particular se detiene en esta línea hasta tener respuesta real.
  const { data, error } = await db.from('productos_practica').select('*');

  // Sin "await" en la línea de arriba, "data" y "error" NO tendrían el
  // resultado todavía — tendrías una "Promise" (promesa) sin resolver,
  // no los datos reales. Eso es justo lo que "await" evita: te obliga
  // a esperar antes de seguir usando el resultado.
  console.log(data, error);

   if (error) {
    // Revisamos "error" ANTES de tocar "data": si la consulta falló,
    // "data" llega como null, y usar null más adelante (ej. null.map())
    // rompería el script. Mismo patrón de "validar antes de operar"
    // que ya usaste en el CRUD de la semana 7.
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // JSON.stringify(data, null, 2) convierte el array completo a texto,
  // con sangría (el "2") para que se lea ordenado. Esta línea SÍ es
  // sincrónica (no necesita await) — ya no estamos esperando nada de
  // Supabase, solo transformando el array "data" que ya llegó.
  document.getElementById('resultado').textContent = JSON.stringify(data, null, 2);

const nombres = data.map(producto => producto.nombre);
  // nombres es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos

  document.getElementById('resultado2').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';

const disponibles = data.map(producto => producto.disponible);
  // disponibles es ahora un array de solo booleanos:
  // [true, false, true]
  // — ya no objetos completos

  document.getElementById('resultado3').innerHTML =
    '<ul>' + disponibles.map(d => `<li>${d ? "Sí" : "No"}</li>`).join('') + '</ul>';

const precios = data.map(producto => producto.precio);
  // precios es ahora un array de solo números:
  // [199900, 299900, 399900]
  // — ya no objetos completos

  document.getElementById('resultado4').innerHTML =
    '<ul>' + precios.map(p => `<li>$${p.toLocaleString("es-CO")}</li>`).join('') + '</ul>';

}); // cierra el listener de 'btn-traer' que se abrió en la línea 1

//CRUD: Crear un nuevo producto
const nuevoProducto = {
  nombre: "Teclado Mecánico RGB",
  descripción: "Teclado mecánico con retroiluminación RGB y switches azules.",
  precio: 249900,
  unidades: 30,
  descuento: 0.15,
  disponible: true,
  caracteristicas: ["Switches mecánicos", "Retroiluminación RGB", "Teclas programables"],
  img_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3Z7QkRANNSEHLDIsyUVxA4Bj-zuEcbD9KAK5-S4znoQ&s=10",
}

// AHORA (Supabase):
async function agregarProducto(datos) {

  const { data, error } = await db
    .from('productos_practica')  // la tabla
    .insert([datos])             // insert() siempre recibe un ARRAY de objetos,
                                  // aunque insertes uno solo
    .select();                    // .select() le pide a Supabase que te
                                   // devuelva la fila ya creada (con su id
                                   // nuevo) — sin esto, insert() no te
                                   // devuelve nada útil

  if (error) {
    console.log("Error al agregar:", error);
    return null;
  }

  return data[0];   // data siempre es un array — tomamos el primer
                     // elemento, que es la fila recién creada
}

// FORMULARIO: crea el producto con lo que escribe el usuario
// (en vez del "nuevoProducto" fijo de arriba).
const form = document.getElementById('form-producto');
const notificacion = document.getElementById('notificación');

form.addEventListener('submit', async (evento) => {
  // Sin esto, el navegador recarga la página al enviar el form
  // y se pierde todo antes de que llegue la respuesta de Supabase.
  evento.preventDefault();

  // Los inputs SIEMPRE devuelven texto ("150000"), aunque sean type="number".
  // Por eso convertimos con Number() antes de mandarlo a columnas numéricas.
  const datos = {
    nombre: form.nombre.value.trim(),
    descripción: form.descripcion.value.trim(),   // la columna lleva tilde
    precio: Number(form.precio.value),
    unidades: Number(form.unidades.value),
    descuento: Number(form.descuento.value) / 100, // 15 (%) -> 0.15, como en la tabla
    disponible: form.disponible.checked,           // checkbox: se lee .checked, no .value
    caracteristicas: form.caracteristicas.value
      .split(',')                 // "tecnología, audio" -> ["tecnología", " audio"]
      .map(c => c.trim())         // quita espacios -> ["tecnología", "audio"]
      .filter(c => c !== ''),     // quita vacíos si sobra una coma
    img_url: form.img_url.value.trim(),
  };

  notificacion.textContent = 'Guardando...';
  const respuesta = await agregarProducto(datos);

  if (respuesta) {
    notificacion.textContent = `Producto creado: ${respuesta.nombre} (id ${respuesta.id})`;
    form.reset();
    // Vuelve a pedir la lista para que aparezca el producto nuevo.
    document.getElementById('btn-traer').click();
  } else {
    notificacion.textContent = 'Error al crear el producto. Revisa la consola (F12).';
  }
}); // } cierra la función, ) cierra addEventListener(