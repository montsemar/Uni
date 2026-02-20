// JavaScript para el carrusel de packs de viaje

$(document).ready(() => {
  // Array de packs de viaje con imágenes
  const packs = [
    {
      titulo: "Pack Sudeste Asiático",
      precio: "600€",
      descripcion: "Vietnam & Camboya: buses, hostales y guía de visados",
      url: "purchase.html?pack=sudeste",
      imagen: "images/vietnam-moto.jpg"
    },
    {
      titulo: "Pack Sudamérica Adventure",
      precio: "750€",
      descripcion: "Perú, Bolivia & Chile: buses nocturnos, hostales y tours",
      url: "purchase.html?pack=sudamerica",
      imagen: "images/peru.jpg"
    },
    {
      titulo: "Pack Safari África",
      precio: "950€",
      descripcion: "Tanzania: safaris guiados, alojamiento y reservas naturales",
      url: "purchase.html?pack=africa",
      imagen: "images/safari.jpg"
    }
  ];

  let indiceActual = 0;
  let intervalo = null;

  // Obtener elementos del DOM con jQuery
  const $carruselContainer = $(".carrusel");
  const $packDiv = $(".carrusel .pack");
  const $btnAnterior = $(".carrusel .ant button");
  const $btnSiguiente = $(".carrusel .sig button");

  if ($packDiv.length === 0 || $btnAnterior.length === 0 || $btnSiguiente.length === 0) {
    console.error("No se encontraron los elementos del carrusel");
    return;
  }

  // Crear indicadores con jQuery
  const $indicatorsDiv = $('<div class="carrusel-indicators"></div>');
  $.each(packs, (index) => {
    const $indicator = $('<div class="carrusel-indicator"></div>');
    if (index === 0) $indicator.addClass('active');
    $indicator.on('click', () => {
      indiceActual = index;
      actualizarCarrusel('fade');
      actualizarIndicadores();
      reiniciarIntervalo();
    });
    $indicatorsDiv.append($indicator);
  });
  $carruselContainer.append($indicatorsDiv);

  // Función para actualizar indicadores con jQuery
  function actualizarIndicadores() {
    $('.carrusel-indicator').each(function(index) {
      $(this).toggleClass('active', index === indiceActual);
    });
  }

  // Función para actualizar el contenido del carrusel con animación
  function actualizarCarrusel(direccion = 'fade') {
    const pack = packs[indiceActual];
    
    // Remover clases de animación previas con jQuery
    $packDiv.removeClass('fade-in slide-left slide-right');
    
    // Trigger reflow para reiniciar animación
    $packDiv[0].offsetWidth;
    
    // Añadir clase de animación según dirección
    if (direccion === 'next') {
      $packDiv.addClass('slide-left');
    } else if (direccion === 'prev') {
      $packDiv.addClass('slide-right');
    } else {
      $packDiv.addClass('fade-in');
    }
    
    // Actualizar imagen de fondo con transición suave usando jQuery
    $packDiv.css({
      'transition': 'background-image 0.5s ease-in-out',
      'background-image': `linear-gradient(rgba(139, 69, 19, 0.4), rgba(218, 165, 32, 0.4)), url("${pack.imagen}")`
    });
    
    // Actualizar contenido con jQuery
    $packDiv.html(`
      <h2 class="tp">
        <span>${pack.titulo}</span>
        <span>${pack.precio}</span>
      </h2>
      <h3>${pack.descripcion}</h3>
      <a href="${pack.url}" class="comprar-btn">Comprar</a>
    `);
  }

  // Función para avanzar al siguiente pack
  function siguientePack() {
    indiceActual = (indiceActual + 1) % packs.length;
    actualizarCarrusel('next');
    actualizarIndicadores();
  }

  // Función para retroceder al pack anterior
  function anteriorPack() {
    indiceActual = (indiceActual - 1 + packs.length) % packs.length;
    actualizarCarrusel('prev');
    actualizarIndicadores();
  }

  // Event listeners para los botones con jQuery
  $btnSiguiente.on("click", (e) => {
    e.preventDefault();
    siguientePack();
    reiniciarIntervalo();
  });

  $btnAnterior.on("click", (e) => {
    e.preventDefault();
    anteriorPack();
    reiniciarIntervalo();
  });

  // Función para iniciar el cambio automático
  function iniciarCambioAutomatico() {
    intervalo = setInterval(siguientePack, 2000);
  }

  // Función para reiniciar el intervalo cuando el usuario interactúa
  function reiniciarIntervalo() {
    if (intervalo) {
      clearInterval(intervalo);
    }
    iniciarCambioAutomatico();
  }

  // Pausar/reanudar carrusel con hover usando jQuery
  $carruselContainer.hover(
    function() {
      // mouseenter
      if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
      }
    },
    function() {
      // mouseleave
      if (!intervalo) {
        iniciarCambioAutomatico();
      }
    }
  );

  // Navegación con teclado usando jQuery
  $(document).on("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      anteriorPack();
      reiniciarIntervalo();
    } else if (e.key === "ArrowRight") {
      siguientePack();
      reiniciarIntervalo();
    }
  });

  // Soporte para gestos táctiles (swipe)
  let touchStartX = 0;
  let touchEndX = 0;

  $carruselContainer.on('touchstart', (e) => {
    touchStartX = e.originalEvent.changedTouches[0].screenX;
  });

  $carruselContainer.on('touchend', (e) => {
    touchEndX = e.originalEvent.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
      // Swipe left
      siguientePack();
      reiniciarIntervalo();
    }
    if (touchEndX > touchStartX + 50) {
      // Swipe right
      anteriorPack();
      reiniciarIntervalo();
    }
  }

  // Inicializar
  actualizarCarrusel();
  iniciarCambioAutomatico();
});
