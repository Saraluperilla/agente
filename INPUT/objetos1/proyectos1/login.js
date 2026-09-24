// Todo lo del login vive aquí: escuchar el formulario, validar con
// validarCredenciales() (de credenciales.js), mostrar el error y
// mostrar/ocultar el CRUD. Lo que pasa DESPUÉS de un login correcto no
// lo decide este archivo: lo decide quien llama a iniciarLogin().
//
// alEntrar es un callback: una función que gestion.js le pasa a
// iniciarLogin() para que la ejecute solo si el login es correcto. Como
// esa función nace dentro de la IIFE de gestion.js, es la única que
// puede cambiar sesionIniciada. Si alguien llama iniciarLogin() desde la
// consola con su propia función, esa función no tiene acceso a nada
// privado de gestion.js, y además solo se ejecutaría con el login correcto.
//
// Es "const" para que no se pueda reemplazar desde la consola (TypeError).
const iniciarLogin = (alEntrar) => {
  const pantallaLogin = document.getElementById("login");
  const formLogin = document.getElementById("form-login");
  const errorLogin = document.getElementById("login-error");

  formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuarioEscrito = formLogin.elements.usuario.value.trim();
    const passwordEscrito = formLogin.elements.password.value;

    if (!validarCredenciales(usuarioEscrito, passwordEscrito)) {
      errorLogin.hidden = false;
      formLogin.elements.password.value = "";
      formLogin.elements.password.focus();
      return;
    }

    pantallaLogin.hidden = true;
    document.querySelector(".sidebar").hidden = false;
    document.querySelector(".contenido").hidden = false;

    alEntrar();
  });

  // Recargar la página vuelve todo a su estado inicial: login visible,
  // CRUD oculto y vacío, y sesionIniciada otra vez en false
  document.getElementById("btn-cerrar-sesion").addEventListener("click", () => {
    location.reload();
  });
};
