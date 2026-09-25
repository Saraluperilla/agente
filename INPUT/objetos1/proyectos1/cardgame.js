// Adaptado de INPUT/objetos1/ejemplojuego/cardgame/cardgame/src/script.js
// (juego de memoria de CodePen). Cambios respecto al original:
// - El array fijo de productos ("bike") se reemplazó por leerAnimales()
//   de data.js, y elegirAnimalesJuego() saca 6 al azar de esa lista en
//   cada partida (el original usaba sus 8 productos siempre completos).
// - No arranca solo al cargar el script: reiniciarJuego() se expone como
//   función global y es game.js quien la llama, recién cuando el jugador
//   entra a la pantalla del juego (si arrancara sola, el cronómetro
//   correría de fondo mientras el jugador todavía está en el login).
// - Reverso de la carta: ícono + texto en vez de una imagen externa (el
//   original traía una URL de Facebook que además estaba rota).
// - El modal de victoria ya no ofrece un "código de descuento" (tenía
//   sentido en el ejemplo de tienda, no en un juego de animales).
// - mostrarVictoria() llama a registrarIntento() (definida en game.js)
//   para guardar el resultado de la partida en el usuario que inició sesión.

// =============================================================================
// 1. ESTADO DEL JUEGO (VARIABLES GLOBALES)
// =============================================================================
var animalesJuego     = []; // Los 6 animales de la partida actual (se elige de nuevo en cada reinicio)
var carta1            = null;  // Elemento HTML de la primera carta clickeada
var carta2            = null;  // Elemento HTML de la segunda carta clickeada
var id1               = null;  // id del animal de la primera carta
var id2               = null;  // id del animal de la segunda carta
var esperando         = false; // Bloquea clics mientras se comparan dos cartas
var paresEncontrados  = 0;     // Cuántas parejas se han hallado
var intentos          = 0;     // Cuántas veces el usuario intentó un par

// Variables del cronómetro
var timerInterval  = null;
var segundosJuego  = 0;
var juegoActivo    = false;

// =============================================================================
// 2. FUNCIONES DEL CRONÓMETRO
// =============================================================================
function iniciarTimer() {
  clearInterval(timerInterval);
  segundosJuego = 0;
  juegoActivo   = true;

  timerInterval = setInterval(function() {
    if (!juegoActivo) return;
    segundosJuego++;

    var mm  = String(Math.floor(segundosJuego / 60)).padStart(2, '0');
    var ss  = String(segundosJuego % 60).padStart(2, '0');

    var hud = document.getElementById('hud-timer');
    hud.textContent = mm + ':' + ss;

    if (segundosJuego >= 120) {
      hud.classList.add('danger');
    }
  }, 1000);
}

function detenerTimer() {
  juegoActivo = false;
  clearInterval(timerInterval);
}

function formatearTiempo(segs) {
  var mm = String(Math.floor(segs / 60)).padStart(2, '0');
  var ss = String(segs % 60).padStart(2, '0');
  return mm + ':' + ss;
}

// =============================================================================
// 3. ALGORITMO DE MEZCLA (FISHER-YATES)
// =============================================================================
function shuffle(array) {
  var copia = array.slice();
  for (var i = copia.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = copia[i];
    copia[i] = copia[j];
    copia[j] = tmp;
  }
  return copia;
}

// =============================================================================
// 4. ELEGIR LOS 6 ANIMALES DE LA PARTIDA
//    leerAnimales() (data.js) puede devolver más de 6 (10 por defecto, o
//    más si se agregaron animales desde gestion.html); se mezclan y se
//    toman los primeros 6, así cada partida sale distinta.
// =============================================================================
function elegirAnimalesJuego() {
  return shuffle(leerAnimales()).slice(0, 6);
}

// =============================================================================
// 5. RENDERIZAR TABLERO
// =============================================================================
function renderizarTablero() {
  var tablero = document.getElementById('tablero');
  tablero.innerHTML = '';

  animalesJuego = elegirAnimalesJuego();
  document.getElementById('hud-pares').textContent = '0/' + animalesJuego.length;

  // Duplicamos los 6 animales (6 -> 12) y mezclamos el mazo completo
  var mazo = shuffle(animalesJuego.concat(animalesJuego));

  mazo.forEach(function(animal) {
    var flipCard = document.createElement('div');
    flipCard.classList.add('flip-card');
    flipCard.dataset.idAnimal = animal.id;

    flipCard.innerHTML =
      '<div class="flip-card-inner">' +
        '<div class="flip-card-front">' +
          '<div class="icono-reverso">🐾</div>' +
          '<div class="marca-reverso">Memoria</div>' +
        '</div>' +
        '<div class="flip-card-back">' +
          '<img src="' + animal.imagen + '" alt="' + animal.nombre + '" loading="lazy" />' +
          '<div class="info-animal">' +
            '<p class="nombre-animal">' + animal.nombre + '</p>' +
            '<p class="habitat-animal">' + animal.habitat + '</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    flipCard.addEventListener('click', function() {
      manejarClic(flipCard);
    });

    tablero.appendChild(flipCard);
  });

  iniciarTimer();
}

// =============================================================================
// 6. MANEJAR CLIC EN UNA CARTA
// =============================================================================
function manejarClic(carta) {
  if (esperando)                              return;
  if (carta.classList.contains('volteada'))   return;
  if (carta.classList.contains('encontrada')) return;

  carta.classList.add('volteada');

  if (!carta1) {
    carta1 = carta;
    id1    = carta.dataset.idAnimal;
    return;
  }

  carta2 = carta;
  id2    = carta.dataset.idAnimal;

  intentos++;
  document.getElementById('hud-intentos').textContent = intentos;

  esperando = true;

  if (id1 === id2) {
    procesarParEncontrado();
  } else {
    setTimeout(voltearDeNuevo, 900);
  }
}

function procesarParEncontrado() {
  carta1.classList.remove('volteada');
  carta2.classList.remove('volteada');
  carta1.classList.add('encontrada', 'bloqueada');
  carta2.classList.add('encontrada', 'bloqueada');

  paresEncontrados++;
  document.getElementById('hud-pares').textContent = paresEncontrados + '/' + animalesJuego.length;

  limpiarSeleccion();

  if (paresEncontrados === animalesJuego.length) {
    detenerTimer();
    setTimeout(mostrarVictoria, 500);
  }
}

function voltearDeNuevo() {
  carta1.classList.remove('volteada');
  carta2.classList.remove('volteada');
  limpiarSeleccion();
}

function limpiarSeleccion() {
  carta1    = null;
  carta2    = null;
  id1       = null;
  id2       = null;
  esperando = false;
}

// =============================================================================
// 7. MENSAJE DE VICTORIA
// =============================================================================
function mostrarVictoria() {
  document.getElementById('stat-tiempo').textContent    = formatearTiempo(segundosJuego);
  document.getElementById('stat-intentos').textContent  = intentos;
  document.getElementById('stat-pares').textContent     = paresEncontrados + '/' + animalesJuego.length;

  document.getElementById('overlay-victoria').classList.add('visible');

  // registrarIntento() es de game.js: guarda este resultado (intentos y
  // tiempo) en el usuario que inició sesión, dentro de "usuariosJuego"
  registrarIntento(intentos, segundosJuego);
}

// =============================================================================
// 8. REINICIAR / EMPEZAR EL JUEGO
//    Es la única función que game.js necesita llamar desde afuera: arma
//    un tablero nuevo con 6 animales al azar y reinicia todos los
//    contadores. Sirve tanto para la primera partida como para "jugar de
//    nuevo" o el botón "Reiniciar" de adentro del juego.
// =============================================================================
function reiniciarJuego() {
  document.getElementById('overlay-victoria').classList.remove('visible');
  carta1           = null;
  carta2           = null;
  id1              = null;
  id2              = null;
  esperando        = false;
  paresEncontrados = 0;
  intentos         = 0;

  document.getElementById('hud-intentos').textContent = '0';
  document.getElementById('hud-timer').textContent    = '00:00';
  document.getElementById('hud-timer').classList.remove('danger');

  renderizarTablero();
}

// =============================================================================
// 9. EVENT LISTENERS
// =============================================================================
document.getElementById('btn-reiniciar').addEventListener('click', reiniciarJuego);
document.getElementById('btn-jugar-de-nuevo').addEventListener('click', reiniciarJuego);

// No se llama reiniciarJuego() aquí: game.js la llama cuando el jugador
// entra a esta pantalla (ver btn-jugar-memoria en game.js)
