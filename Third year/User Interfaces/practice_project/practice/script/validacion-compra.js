// Validación en tiempo real para el formulario de compra

$(document).ready(() => {
  // Función auxiliar para agregar mensajes de validación con jQuery
  const addValidationMessage = ($inputElement) => {
    if ($inputElement.next('.validation-message').length === 0) {
      $('<div class="validation-message"></div>').insertAfter($inputElement);
    }
  };

  // Función para mostrar mensaje con jQuery
  const showMessage = ($inputElement, message, isValid) => {
    const $messageDiv = $inputElement.next('.validation-message');
    if ($messageDiv.length) {
      $messageDiv.text(message).show();
      $inputElement.removeClass('valid invalid').addClass(isValid ? 'valid' : 'invalid');
    }
  };

  // Función para ocultar mensaje con jQuery
  const hideMessage = ($inputElement) => {
    const $messageDiv = $inputElement.next('.validation-message');
    if ($messageDiv.length) {
      $messageDiv.hide();
      $inputElement.removeClass('valid invalid');
    }
  };

  // Validador de nombre completo con jQuery
  const $nombreInput = $('#buyer-name');
  if ($nombreInput.length) {
    addValidationMessage($nombreInput);
    
    $nombreInput.on('blur', () => {
      const value = $nombreInput.val().trim();
      if (value === '') {
        hideMessage($nombreInput);
      } else if (value.length < 3) {
        showMessage($nombreInput, '❌ El nombre debe tener al menos 3 caracteres', false);
      } else {
        showMessage($nombreInput, '✓ Nombre válido', true);
      }
    });

    $nombreInput.on('input', () => {
      if ($nombreInput.hasClass('invalid')) {
        const value = $nombreInput.val().trim();
        if (value.length >= 3) {
          showMessage($nombreInput, '✓ Nombre válido', true);
        }
      }
    });
  }

  // Validador de email con jQuery
  const $emailInput = $('#buyer-email');
  if ($emailInput.length) {
    addValidationMessage($emailInput);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    $emailInput.on('blur', () => {
      const value = $emailInput.val().trim();
      if (value === '') {
        hideMessage($emailInput);
      } else if (!emailRegex.test(value)) {
        showMessage($emailInput, '❌ Email inválido', false);
      } else {
        showMessage($emailInput, '✓ Email válido', true);
      }
    });

    $emailInput.on('input', () => {
      if ($emailInput.hasClass('invalid')) {
        const value = $emailInput.val().trim();
        if (emailRegex.test(value)) {
          showMessage($emailInput, '✓ Email válido', true);
        }
      }
    });
  }

  // Validador de tipo de tarjeta con visualización usando jQuery
  const $tipoTarjetaSelect = $('#card-type');
  if ($tipoTarjetaSelect.length) {
    addValidationMessage($tipoTarjetaSelect);
    
    // Crear contenedor para mostrar el logo de la tarjeta con jQuery
    const $cardLogoContainer = $('<div class="card-logo-container"></div>').css({
      'display': 'inline-block',
      'margin-left': '10px',
      'vertical-align': 'middle'
    });
    $tipoTarjetaSelect.parent().append($cardLogoContainer);

    // Iconos de tarjetas usando emojis
    const cardIcons = {
      'visa': '💳 Visa',
      'mastercard': '💳 Mastercard',
      'amex': '💳 American Express',
      'maestro': '💳 Maestro'
    };

    $tipoTarjetaSelect.on('change', () => {
      const value = $tipoTarjetaSelect.val();
      
      if (value === '') {
        hideMessage($tipoTarjetaSelect);
        $cardLogoContainer.empty();
      } else {
        showMessage($tipoTarjetaSelect, `✓ ${cardIcons[value]} seleccionada`, true);
        $cardLogoContainer.html(`<span style="font-size: 1.2em; color: #2c3e50;">${cardIcons[value]}</span>`);
      }
    });
  }

  // Validador de número de tarjeta con jQuery
  const $numeroTarjetaInput = $('#card-number');
  if ($numeroTarjetaInput.length) {
    addValidationMessage($numeroTarjetaInput);
    
    $numeroTarjetaInput.on('blur', () => {
      const value = $numeroTarjetaInput.val().replace(/\s/g, '');
      
      if (value === '') {
        hideMessage($numeroTarjetaInput);
      } else if (!/^\d+$/.test(value)) {
        showMessage($numeroTarjetaInput, '❌ Solo números permitidos', false);
      } else if (![13, 15, 16, 19].includes(value.length)) {
        showMessage($numeroTarjetaInput, '❌ Número de tarjeta inválido (debe tener 13, 15, 16 o 19 dígitos)', false);
      } else {
        showMessage($numeroTarjetaInput, '✓ Número de tarjeta válido', true);
      }
    });

    $numeroTarjetaInput.on('input', () => {
      if ($numeroTarjetaInput.hasClass('invalid')) {
        const value = $numeroTarjetaInput.val().replace(/\s/g, '');
        if ([13, 15, 16, 19].includes(value.length) && /^\d+$/.test(value)) {
          showMessage($numeroTarjetaInput, '✓ Número de tarjeta válido', true);
        }
      }
    });
  }

  // Validador de titular con jQuery
  const $titularInput = $('#card-holder');
  if ($titularInput.length) {
    addValidationMessage($titularInput);
    
    $titularInput.on('blur', () => {
      const value = $titularInput.val().trim();
      if (value === '') {
        hideMessage($titularInput);
      } else if (value.length < 3) {
        showMessage($titularInput, '❌ El nombre del titular debe tener al menos 3 caracteres', false);
      } else {
        showMessage($titularInput, '✓ Titular válido', true);
      }
    });

    $titularInput.on('input', () => {
      if ($titularInput.hasClass('invalid')) {
        const value = $titularInput.val().trim();
        if (value.length >= 3) {
          showMessage($titularInput, '✓ Titular válido', true);
        }
      }
    });
  }

  // Validador de fecha de caducidad con jQuery
  const $fechaInput = $('#expiry-date');
  if ($fechaInput.length) {
    addValidationMessage($fechaInput);
    
    $fechaInput.on('blur', () => {
      const value = $fechaInput.val().trim();
      
      if (value === '') {
        hideMessage($fechaInput);
      } else if (!/^\d{2}\/\d{2}$/.test(value)) {
        showMessage($fechaInput, '❌ Formato inválido (MM/AA)', false);
      } else {
        const [mes, año] = value.split('/').map(Number);
        const fechaActual = new Date();
        const añoActual = fechaActual.getFullYear() % 100;
        const mesActual = fechaActual.getMonth() + 1;
        
        if (mes < 1 || mes > 12) {
          showMessage($fechaInput, '❌ Mes inválido (01-12)', false);
        } else if (año < añoActual || (año === añoActual && mes < mesActual)) {
          showMessage($fechaInput, '❌ La tarjeta ha caducado', false);
        } else {
          showMessage($fechaInput, '✓ Fecha válida', true);
        }
      }
    });

    $fechaInput.on('input', () => {
      if ($fechaInput.hasClass('invalid')) {
        const value = $fechaInput.val().trim();
        if (/^\d{2}\/\d{2}$/.test(value)) {
          const [mes, año] = value.split('/').map(Number);
          const fechaActual = new Date();
          const añoActual = fechaActual.getFullYear() % 100;
          const mesActual = fechaActual.getMonth() + 1;
          
          if (mes >= 1 && mes <= 12 && (año > añoActual || (año === añoActual && mes >= mesActual))) {
            showMessage($fechaInput, '✓ Fecha válida', true);
          }
        }
      }
    });
  }

  // Validador de CVV con jQuery
  const $cvvInput = $('#cvv');
  if ($cvvInput.length) {
    addValidationMessage($cvvInput);
    
    $cvvInput.on('blur', () => {
      const value = $cvvInput.val().trim();
      
      if (value === '') {
        hideMessage($cvvInput);
      } else if (!/^\d{3}$/.test(value)) {
        showMessage($cvvInput, '❌ El CVV debe tener 3 dígitos', false);
      } else {
        showMessage($cvvInput, '✓ CVV válido', true);
      }
    });

    $cvvInput.on('input', () => {
      if ($cvvInput.hasClass('invalid')) {
        const value = $cvvInput.val().trim();
        if (/^\d{3}$/.test(value)) {
          showMessage($cvvInput, '✓ CVV válido', true);
        }
      }
    });
  }
});
