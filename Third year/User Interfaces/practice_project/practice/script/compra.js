// JavaScript para validar el formulario de compra

$(document).ready(() => {
  const $form = $(".purchase-form");
  
  if ($form.length === 0) {
    console.error("No se encontró el formulario de compra");
    return;
  }

  // Obtener elementos del formulario con jQuery
  const $nombreCompleto = $("#buyer-name");
  const $email = $("#buyer-email");
  const $tipoTarjeta = $("#card-type");
  const $numeroTarjeta = $("#card-number");
  const $titular = $("#card-holder");
  const $fechaCaducidad = $("#expiry-date");
  const $cvv = $("#cvv");
  const $btnComprar = $(".purchase-btn");
  const $btnBorrar = $(".clear-btn");

  // Formatear número de tarjeta mientras se escribe con jQuery
  if ($numeroTarjeta.length) {
    $numeroTarjeta.on("input", function() {
      let valor = $(this).val().replace(/\s/g, '').replace(/\D/g, '');
      let valorFormateado = valor.match(/.{1,4}/g)?.join(' ') || valor;
      $(this).val(valorFormateado);
    });
  }

  // Formatear fecha de caducidad MM/AA con jQuery
  if ($fechaCaducidad.length) {
    $fechaCaducidad.on("input", function() {
      let valor = $(this).val().replace(/\D/g, '');
      if (valor.length >= 2) {
        valor = valor.substring(0, 2) + '/' + valor.substring(2, 4);
      }
      $(this).val(valor);
    });
  }

  // Solo números en CVV con jQuery
  if ($cvv.length) {
    $cvv.on("input", function() {
      $(this).val($(this).val().replace(/\D/g, ''));
    });
  }

  // Función de validación con jQuery
  function validarFormulario() {
    const errores = [];

    // Validar nombre completo (mínimo 3 caracteres)
    if ($nombreCompleto.length === 0 || $nombreCompleto.val().trim().length < 3) {
      errores.push("El nombre completo debe tener al menos 3 caracteres.");
    }

    // Validar email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if ($email.length === 0 || !emailRegex.test($email.val().trim())) {
      errores.push("Debe introducir un correo electrónico válido.");
    }

    // Validar tipo de tarjeta
    if ($tipoTarjeta.length === 0 || $tipoTarjeta.val() === "") {
      errores.push("Debe seleccionar un tipo de tarjeta.");
    }

    // Validar número de tarjeta (13, 15, 16 o 19 dígitos)
    const numTarjetaSinEspacios = $numeroTarjeta.length ? $numeroTarjeta.val().replace(/\s/g, '') : '';
    const longitudesValidas = [13, 15, 16, 19];
    if (!longitudesValidas.includes(numTarjetaSinEspacios.length)) {
      errores.push("El número de tarjeta debe tener 13, 15, 16 o 19 dígitos.");
    }

    // Validar nombre del titular (mínimo 3 caracteres)
    if ($titular.length === 0 || $titular.val().trim().length < 3) {
      errores.push("El nombre del titular debe tener al menos 3 caracteres.");
    }

    // Validar fecha de caducidad
    if ($fechaCaducidad.length === 0 || !$fechaCaducidad.val()) {
      errores.push("Debe introducir la fecha de caducidad.");
    } else {
      const partes = $fechaCaducidad.val().split('/');
      if (partes.length === 2) {
        const mes = parseInt(partes[0], 10);
        const anio = parseInt('20' + partes[1], 10);
        
        if (mes < 1 || mes > 12) {
          errores.push("El mes de caducidad no es válido.");
        } else {
          const fechaActual = new Date();
          const mesActual = fechaActual.getMonth() + 1;
          const anioActual = fechaActual.getFullYear();
          
          if (anio < anioActual || (anio === anioActual && mes < mesActual)) {
            errores.push("La tarjeta ha caducado.");
          }
        }
      } else {
        errores.push("La fecha de caducidad debe tener el formato MM/AA.");
      }
    }

    // Validar CVV (3 dígitos)
    if ($cvv.length === 0 || $cvv.val().length !== 3) {
      errores.push("El CVV debe tener 3 dígitos.");
    }

    return errores;
  }

  // Evento de submit con jQuery
  $form.on("submit", (e) => {
    e.preventDefault();
    
    const errores = validarFormulario();
    
    if (errores.length > 0) {
      Modal.errors(errores, "Errores en el formulario");
    } else {
      Modal.alert("¡Compra realizada con éxito!", "success").then(() => {
        $form[0].reset();
        limpiarValidaciones();
      });
    }
  });

  // Función para limpiar validaciones con jQuery
  function limpiarValidaciones() {
    $form.find('input, select').each(function() {
      $(this).removeClass('valid invalid');
      const $mensajeValidacion = $(this).next('.validation-message');
      if ($mensajeValidacion.length) {
        $mensajeValidacion.hide();
      }
    });
    
    // Limpiar también el logo de la tarjeta si existe
    $('.card-logo-container').empty();
  }

  // Evento del botón borrar con jQuery
  if ($btnBorrar.length) {
    $btnBorrar.on("click", (e) => {
      e.preventDefault();
      Modal.confirm("¿Está seguro de que desea borrar todos los datos del formulario?", () => {
        $form[0].reset();
        limpiarValidaciones();
      });
    });
  }

  // También limpiar validaciones cuando el formulario se resetea por cualquier medio
  $form.on("reset", () => {
    // Usar setTimeout para que se ejecute después del reset del navegador
    setTimeout(() => {
      limpiarValidaciones();
    }, 0);
  });
});
