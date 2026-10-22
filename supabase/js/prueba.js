// prueba.js: aquí escribes el código de los Pasos 2, 3 y 4.
// "db" viene de supabaseClient.js, que se carga antes que este archivo.

const btnTraer = document.getElementById("btn-traer");
const resultado = document.getElementById("resultado");

// El nombre tiene que ser IGUAL al de Table Editor, letra por letra.
const TABLA = "productos_practica";

// Paso 2: función que pide los productos a Supabase.
// Es async porque la respuesta llega por internet: hay que esperarla con await.
// Supabase no lanza el error, lo devuelve dentro de { data, error }.
const traerProductos = async () => {
  resultado.textContent = "Cargando...";

  const { data, error } = await db.from(TABLA).select("*").order("id");

  if (error) {
    console.error(error);
    resultado.textContent = `Error: ${error.message}`;
    return;
  }

  if (data.length === 0) {
    resultado.textContent = "La tabla existe pero está vacía.";
    return;
  }

  // Paso 3: mostrar los datos en la página, una card por producto.
  resultado.innerHTML = "";
  data.forEach((producto) => {
    const card = document.createElement("article");
    card.style.cssText = "border:1px solid #ccc; padding:8px; margin:8px 0; max-width:320px;";

    // "descripción" lleva tilde en la tabla, por eso se lee con corchetes.
    card.innerHTML = `
      <img src="${producto.img_url}" alt="${producto.nombre}" style="width:100%;">
      <h3>${producto.nombre}</h3>
      <p>${producto["descripción"] ?? ""}</p>
      <p><strong>Precio:</strong> $${producto.precio.toLocaleString("es-CO")}</p>
      <p><strong>Unidades:</strong> ${producto.unidades}</p>
      <p><strong>Descuento:</strong> ${producto.descuento * 100}%</p>
      <p><strong>Disponible:</strong> ${producto.disponible ? "Sí" : "No"}</p>
      <p><strong>Características:</strong> ${(producto.caracteristicas || []).join(", ")}</p>
    `;
    resultado.appendChild(card);
  });
};

// Paso 4: conectar el botón con la función.
// Sin esta línea, hacer clic no hace nada.
btnTraer.addEventListener("click", traerProductos);
