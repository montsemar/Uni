// JavaScript para la página home_b.html

$(document).ready(() => {
  // Comprobar si hay sesión iniciada
  const sesion = localStorage.getItem("sesionIniciada");
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

  if (!sesion || sesion !== "true" || !usuarioActual) {
    Modal.alert("Debe iniciar sesión primero.", "warning").then(() => {
      window.location.href = "home_a.html"; // vuelve al inicio
    });
    return;
  }

  // Mostrar los datos del usuario con jQuery
  $("#nombre-usuario").text(usuarioActual.login);

  // Botón de cerrar sesión con jQuery
  $(".logout-btn").on("click", (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del enlace
    Modal.confirm("¿Desea cerrar sesión?", () => {
      localStorage.removeItem("sesionIniciada");
      localStorage.removeItem("usuarioActual");
      window.location.href = "home_a.html"; // vuelve a home_a.html
    });
  });
});
