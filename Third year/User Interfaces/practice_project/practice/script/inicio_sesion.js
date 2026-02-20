// JavaScript para manejar el inicio de sesión

$(document).ready(() => {
  const $form = $("#IniciarSesion");
  const $userInput = $("#Usuario");
  const $passInput = $("#Contraseña");
  const $checkbox = $("#recordar");

  // Cargar credenciales guardadas si existen
  if (localStorage.getItem("recordar") === "true") {
    $userInput.val(localStorage.getItem("usuarioRecordado") || "");
    $passInput.val(localStorage.getItem("contraseñaRecordada") || "");
    $checkbox.prop('checked', true);
  }

  // Detectar intento de inicio de sesión con jQuery
  $form.on("submit", (event) => {
    event.preventDefault(); // Prevenir envío del formulario

    const usuario = $userInput.val().trim();
    const password = $passInput.val().trim();

    // Validar que se hayan ingresado datos
    if (!usuario || !password) {
      Modal.alert("Por favor, ingrese usuario y contraseña.", "warning");
      return;
    }

    // Recuperar usuarios registrados
    const userData = JSON.parse(localStorage.getItem("usuarios")) || [];
    
    if (userData.length === 0) {
      Modal.alert("No hay usuarios registrados. Por favor, regístrese primero.", "warning");
      return;
    }

    let num = -1;
    let user_found = false;
    let pass_found = false;
    
    for (let i = 0; i < userData.length; i++) {
      if (usuario === userData[i].login) {
        user_found = true;
        if (password === userData[i].password) {
          num = i;
          pass_found = true;
          break;
        }
      }
    }

    if (!user_found) {
      Modal.alert("El usuario no está registrado.", "error");
      return;
    }
    
    if (user_found && !pass_found) {
      Modal.alert("Contraseña incorrecta.", "error");
      return;
    }

    if (user_found && pass_found) {
      // Guardar credenciales si está marcado "Recordar credenciales"
      if ($checkbox.is(':checked')) {
        localStorage.setItem("recordar", "true");
        localStorage.setItem("usuarioRecordado", usuario);
        localStorage.setItem("contraseñaRecordada", password);
      } else {
        // Si no está marcado, borrar las credenciales guardadas
        localStorage.removeItem("recordar");
        localStorage.removeItem("usuarioRecordado");
        localStorage.removeItem("contraseñaRecordada");
      }

      // Guardar estado de sesión
      localStorage.setItem("usuarioActual", JSON.stringify(userData[num]));
      localStorage.setItem("sesionIniciada", "true");
      window.location.href = "home_b.html"; // Redirigir a home_b.html
    }
  });
});
