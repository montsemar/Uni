// Validación en tiempo real para el formulario de registro

$(document).ready(() => {
  const $nombre = $("#nombre");
  const $apellidos = $("#apellidos");
  const $email = $("#email");
  const $email2 = $("#confirm-email");
  const $login = $("#login");
  const $password = $("#password");
  const $fecha = $("#birthdate");
  const $imagen = $("#profile-pic");

  // Crear contenedores para mensajes de validación con jQuery
  function addValidationMessage($input) {
    if ($input.next('.validation-message').length === 0) {
      $('<div class="validation-message"></div>').insertAfter($input);
    }
  }

  // Mostrar mensaje con jQuery
  function showMessage($input, message, type) {
    const $msgElement = $input.next('.validation-message');
    if ($msgElement.length) {
      $msgElement.text(message).attr('class', `validation-message ${type} show`);
    }
  }

  // Ocultar mensaje con jQuery
  function hideMessage($input) {
    $input.next('.validation-message').removeClass('show');
  }

  // Validar nombre (mínimo 3 caracteres)
  if ($nombre.length) {
    addValidationMessage($nombre);
    $nombre.on('input', () => {
      const value = $nombre.val().trim();
      if (value.length === 0) {
        $nombre.removeClass('valid invalid');
        hideMessage($nombre);
      } else if (value.length < 3) {
        $nombre.removeClass('valid').addClass('invalid');
        showMessage($nombre, `Faltan ${3 - value.length} caracteres`, 'error');
      } else {
        $nombre.removeClass('invalid').addClass('valid');
        showMessage($nombre, '✓ Nombre válido', 'success');
      }
    });
  }

  // Validar apellidos (mínimo dos palabras de 3 caracteres cada una)
  if ($apellidos.length) {
    addValidationMessage($apellidos);
    $apellidos.on('input', () => {
      const value = $apellidos.val().trim();
      const partes = value.split(' ').filter(Boolean);
      
      if (value.length === 0) {
        $apellidos.removeClass('valid invalid');
        hideMessage($apellidos);
      } else if (partes.length < 2) {
        $apellidos.removeClass('valid').addClass('invalid');
        showMessage($apellidos, 'Se requieren al menos dos apellidos', 'error');
      } else if (partes.some(p => p.length < 3)) {
        $apellidos.removeClass('valid').addClass('invalid');
        showMessage($apellidos, 'Cada apellido debe tener al menos 3 caracteres', 'error');
      } else {
        $apellidos.removeClass('invalid').addClass('valid');
        showMessage($apellidos, '✓ Apellidos válidos', 'success');
      }
    });
  }

  // Validar email con jQuery
  if ($email.length) {
    addValidationMessage($email);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    $email.on('input', () => {
      const value = $email.val().trim();
      if (value.length === 0) {
        $email.removeClass('valid invalid');
        hideMessage($email);
      } else if (!emailRegex.test(value)) {
        $email.removeClass('valid').addClass('invalid');
        showMessage($email, 'Formato de email inválido', 'error');
      } else {
        $email.removeClass('invalid').addClass('valid');
        showMessage($email, '✓ Email válido', 'success');
      }
      
      // Revalidar confirmación si ya tiene valor
      if ($email2.length && $email2.val()) {
        $email2.trigger('input');
      }
    });
  }

  // Validar confirmación de email con jQuery
  if ($email2.length) {
    addValidationMessage($email2);
    $email2.on('input', () => {
      const value = $email2.val().trim();
      if (value.length === 0) {
        $email2.removeClass('valid invalid');
        hideMessage($email2);
      } else if (value !== $email.val().trim()) {
        $email2.removeClass('valid').addClass('invalid');
        showMessage($email2, 'Los emails no coinciden', 'error');
      } else {
        $email2.removeClass('invalid').addClass('valid');
        showMessage($email2, '✓ Los emails coinciden', 'success');
      }
    });
  }

  // Validar login (mínimo 5 caracteres) con jQuery
  if ($login.length) {
    addValidationMessage($login);
    $login.on('input', () => {
      const value = $login.val().trim();
      if (value.length === 0) {
        $login.removeClass('valid invalid');
        hideMessage($login);
      } else if (value.length < 5) {
        $login.removeClass('valid').addClass('invalid');
        showMessage($login, `Faltan ${5 - value.length} caracteres`, 'error');
      } else {
        $login.removeClass('invalid').addClass('valid');
        showMessage($login, '✓ Nombre de usuario válido', 'success');
      }
    });
  }

  // Validar contraseña con requisitos visuales usando jQuery
  if ($password.length) {
    // Crear panel de requisitos con jQuery
    const $requirementsDiv = $(`
      <div class="password-requirements">
        <h4>La contraseña debe contener:</h4>
        <div class="requirement" data-req="length">
          <span class="icon">○</span>
          <span>Al menos 8 caracteres</span>
        </div>
        <div class="requirement" data-req="numbers">
          <span class="icon">○</span>
          <span>Al menos 2 números</span>
        </div>
        <div class="requirement" data-req="special">
          <span class="icon">○</span>
          <span>Al menos 1 carácter especial (!@#$%^&*)</span>
        </div>
        <div class="requirement" data-req="uppercase">
          <span class="icon">○</span>
          <span>Al menos 1 letra mayúscula</span>
        </div>
        <div class="requirement" data-req="lowercase">
          <span class="icon">○</span>
          <span>Al menos 1 letra minúscula</span>
        </div>
      </div>
    `);
    $password.parent().append($requirementsDiv);

    $password.on('input', () => {
      const value = $password.val();
      
      // Validar cada requisito
      const requirements = {
        length: value.length >= 8,
        numbers: (value.match(/\d/g) || []).length >= 2,
        special: /[!@#$%^&*]/.test(value),
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value)
      };

      // Actualizar visualización de requisitos con jQuery
      $.each(requirements, (req, met) => {
        const $element = $requirementsDiv.find(`[data-req="${req}"]`);
        if (met) {
          $element.addClass('met').find('.icon').text('✓');
        } else {
          $element.removeClass('met').find('.icon').text('○');
        }
      });

      // Validar globalmente
      const allMet = Object.values(requirements).every(v => v);
      if (value.length === 0) {
        $password.removeClass('valid invalid');
      } else if (allMet) {
        $password.removeClass('invalid').addClass('valid');
      } else {
        $password.removeClass('valid').addClass('invalid');
      }
    });
  }

  // Validar fecha de nacimiento con jQuery
  if ($fecha.length) {
    addValidationMessage($fecha);
    $fecha.on('change', () => {
      const value = $fecha.val();
      if (!value) {
        $fecha.removeClass('valid invalid');
        hideMessage($fecha);
        return;
      }

      const fechaNacimiento = new Date(value);
      const hoy = new Date();
      const edad = Math.floor((hoy - fechaNacimiento) / (365.25 * 24 * 60 * 60 * 1000));

      if (fechaNacimiento > hoy) {
        $fecha.removeClass('valid').addClass('invalid');
        showMessage($fecha, 'La fecha no puede ser futura', 'error');
      } else if (edad < 18) {
        $fecha.removeClass('invalid').addClass('valid');
        showMessage($fecha, `✓ Tienes ${edad} años`, 'info');
      } else {
        $fecha.removeClass('invalid').addClass('valid');
        showMessage($fecha, `✓ Tienes ${edad} años`, 'success');
      }
    });
  }

  // Validar archivo de imagen con jQuery
  if ($imagen.length) {
    addValidationMessage($imagen);
    $imagen.on('change', function() {
      const file = this.files[0];
      if (!file) {
        $imagen.removeClass('valid invalid');
        hideMessage($imagen);
        return;
      }

      // Solo webp, jpg/jpeg y png
      const formatosValidos = ["image/webp", "image/jpeg", "image/jpg", "image/png"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!formatosValidos.includes(file.type.toLowerCase())) {
        $imagen.removeClass('valid').addClass('invalid');
        showMessage($imagen, 'Solo se permiten imágenes WEBP, JPG o PNG', 'error');
      } else if (file.size > maxSize) {
        $imagen.removeClass('valid').addClass('invalid');
        showMessage($imagen, 'La imagen es demasiado grande (máx. 5MB)', 'error');
      } else {
        $imagen.removeClass('invalid').addClass('valid');
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        showMessage($imagen, `✓ Imagen seleccionada (${sizeMB}MB)`, 'success');
      }
    });
  }
});
