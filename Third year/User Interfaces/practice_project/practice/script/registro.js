// Javascript para manejar el registro de usuarios

$(document).ready(() => {
  // Obtener los elementos del formulario con jQuery
  const $form = $(".register-form");
  const $nombre = $("#nombre");
  const $apellidos = $("#apellidos");
  const $email = $("#email");
  const $email2 = $("#confirm-email");
  const $fecha = $("#birthdate");
  const $login = $("#login");
  const $password = $("#password");
  const $imagen = $("#profile-pic");
  const $privacidad = $("#privacy-policy");
  const $guardar = $(".register-submit"); // botón con clase .register-submit

  // Desactivar el botón hasta que se acepte la política con jQuery
  $guardar.prop('disabled', true).css('opacity', '0.5');

  $privacidad.on("change", () => {
    if ($privacidad.is(':checked')) {
      $guardar.prop('disabled', false).css('opacity', '1');
    } else {
      $guardar.prop('disabled', true).css('opacity', '0.5');
    }
  });

  // Comprime la imagen usando canvas y devuelve dataURL 
  // (Nos salía error QuotaExceeded al guardar imágenes)
  function compressImageFile(file, maxWidth = 1024, maxHeight = 1024, quality = 0.75) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Error leyendo archivo"));
      reader.onload = () => {
        img.onload = () => {
          let { width, height } = img;
          let scale = Math.min(1, Math.min(maxWidth / width, maxHeight / height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
          const dataURL = canvas.toDataURL(mime, quality);
          resolve(dataURL);
        };
        img.onerror = () => reject(new Error("Error cargando imagen"));
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Función para limpiar validaciones con jQuery
  function limpiarValidaciones() {
    $form.find('input, select, textarea').each(function() {
      $(this).removeClass('valid invalid');
      const $mensajeValidacion = $(this).next('.validation-message');
      if ($mensajeValidacion.length) {
        $mensajeValidacion.hide();
      }
    });
    
    // Limpiar también el panel de requisitos de contraseña si existe
    $('.password-requirements').hide();
  }

  // --- Validación y guardado de datos con jQuery ---
  $guardar.on("click", async (event) => {
    event.preventDefault(); // evita redirección automática

    // --- VALIDACIONES ---
    const errores = [];

    // Nombre: mínimo 3 caracteres
    if ($nombre.val().trim().length < 3) {
      errores.push("El nombre debe tener al menos 3 caracteres.");
    }

    // Apellidos: al menos dos palabras de 3 letras cada una
    const partesApellidos = $apellidos.val().trim().split(" ").filter(Boolean);
    if (partesApellidos.length < 2 || partesApellidos.some(p => p.length < 3)) {
      errores.push("Debe introducir al menos dos apellidos de 3 letras cada uno.");
    }

    // Email y confirmación iguales + formato válido
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test($email.val())) {
      errores.push("Correo electrónico no válido.");
    } else if ($email.val() !== $email2.val()) {
      errores.push("Los correos no coinciden.");
    }

    // Fecha de nacimiento válida (no futura)
    const fechaNacimiento = new Date($fecha.val());
    const hoy = new Date();
    if (!$fecha.val() || fechaNacimiento > hoy) {
      errores.push("Debe introducir una fecha de nacimiento válida.");
    }

    // Login: mínimo 5 caracteres
    if ($login.val().trim().length < 5) {
      errores.push("El nombre de usuario debe tener al menos 5 caracteres.");
    }

    // Password: 8 caracteres, 2 números, 1 mayúscula, 1 minúscula, 1 carácter especial
    const passRegex = /^(?=.*[0-9].*[0-9])(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!passRegex.test($password.val())) {
      errores.push("La contraseña debe tener mínimo 8 caracteres incluyendo 2 números, 1 mayúscula, 1 minúscula y 1 carácter especial.");
    }

    // Imagen: formatos válidos (solo webp, jpg/jpeg y png)
    const archivo = $imagen[0].files[0];
    if (!archivo) {
      errores.push("Debe subir una imagen de perfil.");
    } else {
      const formatosValidos = ["image/webp", "image/jpeg", "image/jpg", "image/png"];
      if (!formatosValidos.includes(archivo.type.toLowerCase())) {
        errores.push("Formato de imagen no válido, solo se permiten WEBP, JPG o PNG.");
      }
    }
    // Checkbox privacidad
    if (!$privacidad.is(':checked')) {
      errores.push("Debe aceptar la política de privacidad.");
    }
    // Si hay errores, mostrarlos
    if (errores.length > 0) {
      Modal.errors(errores, "Errores en el registro");
      return;
    }

    // Preparar clave para imagen (única por usuario)
    const imageKey = `img_${$login.val().trim()}`;

    // Intentar comprimir y almacenar la imagen
    let imagenGuardadaLocal = null; // si se guarda en localStorage: dataURL

    try {
      const compressedDataURL = await compressImageFile(archivo, 1024, 1024, 0.75);
      localStorage.setItem(imageKey, compressedDataURL);
      imagenGuardadaLocal = imageKey; // clave en localStorage
    } catch (e) {
      Modal.alert("No se pudo procesar la imagen. Intente con otra o reduzca su tamaño.", "error");
      return;
    }

    // Construir usuario con referencias de imagen usando valores de jQuery
    const usuario = {
        nombre: $nombre.val().trim(),
        apellidos: $apellidos.val().trim(),
        email: $email.val().trim(),
        fechaNacimiento: $fecha.val(),
        login: $login.val().trim(),
        password: $password.val(),
        imagen: imagenGuardadaLocal, // puede ser null
    };

    // Recuperar usuarios previos
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Comprobar duplicado por login o email
    const existe = usuarios.some(u => u.login === usuario.login || u.email === usuario.email);

    if (existe) {
      Modal.alert("Ya existe un usuario con este usuario o correo electrónico.", "error");
      return; // Detiene el proceso
    }

    // Añadir nuevo usuario y guardar
    usuarios.push(usuario);

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    localStorage.setItem("usuarioActual", JSON.stringify(usuario));
    localStorage.setItem("sesionIniciada", "true");

    Modal.alert("¡Registro completado correctamente! Redirigiendo...", "success").then(() => {
      window.location.href = "home_b.html"; // Redirige a home_b.html
    });
  });
});
