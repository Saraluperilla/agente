// usuario y password viven DENTRO de la función, así desde la consola no
// se pueden leer ni cambiar con usuario = "x" (daría ReferenceError).
// validarCredenciales es "const" para que tampoco se pueda reemplazar con
// validarCredenciales = () => true (daría TypeError).
// Ojo: el texto de este archivo igual se puede leer en F12 → Sources;
// esconder la contraseña de verdad requiere validarla en un servidor.
const validarCredenciales = (usuarioEscrito, passwordEscrito) => {
  const usuario = "admin";
  const password = "admin1234";
  return usuarioEscrito === usuario && passwordEscrito === password;
};
