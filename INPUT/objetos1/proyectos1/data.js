// data.js solo expone UNA cosa global: leerAnimales(). El arreglo y los
// datos viven dentro de la función, así desde la consola no se puede
// hacer animales.push() ni animales.pop() sobre los datos de la página.
// Es "const" para que tampoco se pueda reemplazar con
// leerAnimales = () => [] (daría TypeError: Assignment to constant variable).
// Cada llamada devuelve un arreglo NUEVO: modificarlo no cambia lo guardado;
// para guardar hay que pasar por gestion.js, que exige login.
const leerAnimales = () => {
  const animalesIniciales = [
    {
      id: 1,
      nombre: "León",
      imagen: "https://content.nationalgeographic.com.es/medio/2024/08/09/leon-masai-mara-kenia-antonio_28569739_240809155946_800x800.jpg",
      descripcion: "El león es el único felino que vive en manada, llamada orgullo. Los machos se distinguen por su melena, y las hembras son las principales cazadoras del grupo.",
      habitat: "Sabana",
      alimentacion: "Carnívoro",
      pesoKg: 190,
      peligroso: true,
      habilidades: ["Cazar", "Correr", "Rugir"],
    },
    {
      id: 2,
      nombre: "Elefante",
      imagen:"https://content.nationalgeographic.com.es/medio/2026/08/13/1-elefante_819f7e8a_260813151716_800x800.webp",
      descripcion: "El elefante es el mamífero terrestre más grande del mundo. Usa su trompa para comer, beber y comunicarse, y vive en manadas lideradas por una hembra matriarca.",
      habitat: "Sabana",
      alimentacion: "Herbívoro",
      pesoKg: 5500,
      peligroso: false,
      habilidades: ["Nadar", "Usar la trompa", "Cargar peso"],
    },
    {
      id: 3,
      nombre: "Tigre",
      imagen:"https://content.nationalgeographic.com.es/medio/2024/04/12/tigre-sumatra-en-libertad_00000000_ef50936c_240412092732_800x800.jpg",
      descripcion: "El tigre es el felino más grande del mundo y un cazador solitario. Sus rayas son únicas en cada individuo, como una huella digital.",
      habitat: "Selva",
      alimentacion: "Carnívoro",
      pesoKg: 220,
      peligroso: true,
      habilidades: ["Cazar", "Nadar", "Trepar"],
    },
    {
      id: 4,
      nombre: "Jirafa",
      imagen:"https://static.nationalgeographicla.com/files/styles/image_3200/public/01-giraffe-spots-nationalgeographic_2424106.webp?w=1600&h=1067&q=100",
      posicionImagen: "center 10%",
      descripcion: "La jirafa es el animal terrestre más alto del planeta gracias a su largo cuello, que también usa para pelear entre machos a cabezazos.",
      habitat: "Sabana",
      alimentacion: "Herbívoro",
      pesoKg: 1100,
      peligroso: false,
      habilidades: ["Correr", "Alcanzar árboles altos", "Patear"],
    },
    {
      id: 5,
      nombre: "Delfín",
      imagen: "https://pymstatic.com/17949/conversions/inteligencia-de-delfines-wide.jpg",
      descripcion: "El delfín es uno de los animales más inteligentes del océano. Se comunica mediante silbidos y usa la ecolocalización para orientarse y cazar.",
      habitat: "Océano",
      alimentacion: "Carnívoro",
      pesoKg: 300,
      peligroso: false,
      habilidades: ["Nadar", "Saltar", "Comunicarse"],
    },
    {
      id: 6,
      nombre: "Oso Polar",
      imagen:"https://assets.worldwildlife.org/www-prd/images/wwfcmsprodimagespolar.2e16d0ba.format-webp.fill-660x660.webp",
      descripcion: "El oso polar es el mayor depredador terrestre del Ártico. Su pelaje blanco lo camufla en la nieve, y una gruesa capa de grasa lo protege del frío extremo.",
      habitat: "Ártico",
      alimentacion: "Carnívoro",
      pesoKg: 450,
      peligroso: true,
      habilidades: ["Nadar", "Cazar", "Resistir el frío"],
    },
    {
      id: 7,
      nombre: "Águila",
      imagen:"https://static.wikia.nocookie.net/ficcion-sin-limites/images/0/02/Aguila_2.0.jpg/revision/latest?cb=20220905183220&path-prefix=es",
      descripcion: "El águila tiene una de las vistas más agudas del reino animal, capaz de detectar una presa a varios kilómetros de distancia mientras vuela.",
      habitat: "Montañas",
      alimentacion: "Carnívoro",
      pesoKg: 25,
      peligroso: false,
      habilidades: ["Volar", "Cazar", "Ver a larga distancia"],
    },
    {
      id: 8,
      nombre: "Cocodrilo",
      imagen:"https://content.nationalgeographic.com.es/medio/2024/07/16/shutterstock-603944903_c87c9e92_240716092841_800x800.jpg",
      posicionImagen: "25% 40%",
      descripcion: "El cocodrilo es un depredador que ha cambiado poco en millones de años. Puede permanecer casi inmóvil durante horas antes de atacar con gran velocidad.",
      habitat: "Ríos y pantanos",
      alimentacion: "Carnívoro",
      pesoKg: 500,
      peligroso: true,
      habilidades: ["Nadar", "Cazar", "Camuflarse"],
    },
    {
      id: 9,
      nombre: "Cebra",
      imagen:"https://cdn0.ecologiaverde.com/es/posts/3/7/7/cebra_5773_orig.jpg",
      posicionImagen: "78% 20%",
      descripcion: "La cebra tiene un patrón de rayas único para cada individuo, que podría ayudar a confundir a los depredadores y a regular su temperatura corporal.",
      habitat: "Sabana",
      alimentacion: "Herbívoro",
      pesoKg: 350,
      peligroso: false,
      habilidades: ["Correr", "Patear", "Vivir en manada"],
    },
    {
      id: 10,
      nombre: "Pingüino",
      imagen:"https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Pygoscelis_papua.jpg/250px-Pygoscelis_papua.jpg?utm_source=es.wikipedia.org&utm_campaign=parser&utm_content=thumbnail",
      posicionImagen: "center 15%",
      descripcion: "El pingüino no puede volar, pero es un excelente nadador. Vive en grandes colonias, y ambos padres se turnan para cuidar el huevo.",
      habitat: "Antártida",
      alimentacion: "Carnívoro",
      pesoKg: 35,
      peligroso: false,
      habilidades: ["Nadar", "Bucear", "Resistir el frío"],
    },
  ];

  // localStorage guarda solo texto, por eso se usa JSON.parse() al leer
  // (y JSON.stringify() al escribir, en gestion.js). Es lo mismo en todas
  // las pestañas del mismo origen (index.html y gestion.html): si ya hay
  // animales guardados de una sesión anterior, se usan esos en vez del
  // arreglo de arriba.
  const animalesGuardados = localStorage.getItem("animales");
  const animales = animalesGuardados ? JSON.parse(animalesGuardados) : animalesIniciales;

  // Los animales guardados en localStorage antes de que existiera "id" no
  // lo tienen; se les asigna el siguiente libre (id más alto + 1).
  let idMaximo = 0;
  animales.forEach((animal) => {
    if (animal.id > idMaximo) {
      idMaximo = animal.id;
    }
  });
  animales.forEach((animal) => {
    if (animal.id === undefined) {
      idMaximo++;
      animal.id = idMaximo;
    }
  });

  return animales;
};

