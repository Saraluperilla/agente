/* Pasos 3 y 4 — comentados para que no compitan con la tabla de abajo:
   los tres listeners escuchan el mismo botón y escriben en el mismo
   #resultado, así que ganaría el que termine de último.

document.getElementById('btn-traer').addEventListener('click', async () => {

  // Mismo "async" que en el Paso 2: esta función necesita "await" para
  // esperar la respuesta real de Supabase antes de seguir.
  const { data, error } = await db.from('productos_practica').select('*');
  // ↑ El código se DETIENE en esta línea hasta que la base de datos
  //   responde. Compáralo con localStorage.getItem('productos'): esa
  //   llamada te devuelve el valor guardado EN EL MISMO INSTANTE, sin
  //   esperar nada, porque no sale de tu computador. Esta línea sí
  //   puede tardar (viaja a internet y vuelve) — por eso necesita await.

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
});

document.getElementById('btn-traer').addEventListener('click', async () => {

  // async/await, igual que en los Pasos 2 y 3: necesitamos esperar la
  // respuesta real de Supabase antes de poder usar "data".
  const { data, error } = await db.from('productos_practica').select('*');

  if (error) {
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // map() es SINCRÓNICO (igual que con cualquier array normal, como ya
  // usaste en localStorage/semana 8) — por eso NO lleva await. No viaja
  // a ningún lado: solo transforma el array "data" que ya tienes en
  // memoria, después de que el await de arriba terminó de esperar.
  // Esta es la diferencia clave a quedarte con esta sección: "await" es
  // solo para lo que viaja por la red (la consulta a Supabase); una vez
  // que los datos ya están en tu computador, trabajar con ellos
  // (map, filter, etc.) es exactamente igual que con localStorage.
  const nombres = data.map(producto => producto.nombre);
  // nombres es ahora un array de solo strings:
  // ["Audífonos Bluetooth X200", "Camiseta Básica Algodón", "Silla Gamer ProMax"]
  // — ya no objetos completos

  document.getElementById('resultado').innerHTML =
    '<ul>' + nombres.map(n => `<li>${n}</li>`).join('') + '</ul>';
});
*/

// Tabla con todos los productos.
document.getElementById('btn-traer').addEventListener('click', async () => {

  const { data, error } = await db.from('productos_practica').select('*');

  if (error) {
    document.getElementById('resultado').textContent = 'Error: ' + error.message;
    return;
  }

  // Mismo patrón del Paso 4: map() convierte cada objeto en un texto
  // (ahora una fila <tr> en vez de un <li>) y join('') los pega.
  const filas = data.map(producto => `
    <tr>
      <td><img src="${producto.img_url}" alt="${producto.nombre}"></td>
      <td>${producto.id}</td>
      <td>${producto.nombre}</td>
      <td>${producto['descripción']}</td>
      <td>$${producto.precio.toLocaleString('es-CO')}</td>
      <td>${producto.unidades}</td>
      <td>${Math.round(producto.descuento * 100)}%</td>
      <td>${producto.disponible ? 'Sí' : 'No'}</td>
      <td>${producto.caracteristicas.join(', ')}</td>
    </tr>
  `).join('');
  // producto['descripción'] va con corchetes porque la columna tiene
  // tilde; producto.descripción también funcionaría en JS, pero los
  // corchetes dejan claro que es el nombre exacto de la columna.
  // caracteristicas es un array (text[] en Supabase) → join(', ') lo
  // vuelve un texto separado por comas.

  document.getElementById('resultado').innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Imagen</th><th>ID</th><th>Nombre</th><th>Descripción</th><th>Precio</th>
          <th>Unidades</th><th>Descuento</th><th>Disponible</th><th>Características</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
});