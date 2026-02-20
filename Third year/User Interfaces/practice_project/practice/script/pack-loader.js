// JavaScript para cargar dinámicamente el pack seleccionado

$(document).ready(() => {
  // Definir los packs disponibles (mismo que en carrusel.js)
  const packs = {
    sudeste: {
      nombre: "Pack Sudeste Asiático",
      precio: 600,
      imagen: "images/vietnam-moto.jpg",
      descripcion: "Vietnam & Camboya: buses, hostales y guía de visados",
      incluye: [
        "🚌 Transporte en buses locales",
        "🏨 Hostales seleccionados (7 noches)",
        "📋 Guía completa de visados",
        "🗺️ Mapas offline de Vietnam y Camboya",
        "📱 App móvil con itinerario",
        "🆘 Soporte 24/7 durante el viaje"
      ],
      destinos: "Ho Chi Minh • Phnom Penh • Siem Reap • Hanoi",
      duracion: "14 días / 13 noches"
    },
    sudamerica: {
      nombre: "Pack Sudamérica Adventure",
      precio: 750,
      imagen: "images/peru.jpg",
      descripcion: "Perú, Bolivia & Chile: buses nocturnos, hostales y tours",
      incluye: [
        "🚌 Buses nocturnos entre ciudades",
        "🏨 Hostales y albergues (10 noches)",
        "🎫 Entradas a Machu Picchu y Salar de Uyuni",
        "🗺️ Guías locales en español",
        "🍽️ 5 comidas típicas incluidas",
        "📸 Seguro de viaje completo"
      ],
      destinos: "Lima • Cusco • La Paz • Uyuni • Santiago",
      duracion: "18 días / 17 noches"
    },
    africa: {
      nombre: "Pack Safari África",
      precio: 950,
      imagen: "images/safari.jpg",
      descripcion: "Tanzania: safaris guiados, alojamiento y reservas naturales",
      incluye: [
        "🚙 Safari en 4x4 con guía experto",
        "🏕️ Lodges y campamentos (6 noches)",
        "🦁 Entrada a Serengeti y Ngorongoro",
        "📷 Equipo fotográfico profesional",
        "🍽️ Pensión completa durante safaris",
        "✈️ Vuelos internos incluidos"
      ],
      destinos: "Arusha • Serengeti • Ngorongoro • Zanzíbar",
      duracion: "10 días / 9 noches"
    }
  };

  // Obtener el pack de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const packId = urlParams.get('pack') || 'sudeste'; // Por defecto sudeste asiático
  
  const pack = packs[packId] || packs.sudeste;

  // Actualizar la información del pack en el HTML con jQuery
  const $packImage = $('.pack-image img');
  const $packTitle = $('.pack-info h2');
  const $packPrice = $('.pack-price');
  const $packList = $('.pack-description ul');
  const $packHighlights = $('.pack-highlights p');
  const $packDuration = $('.pack-duration');
  const $summaryPackName = $('.summary-item:first-child span:first-child');
  const $summaryPackPrice = $('.summary-item:first-child span:last-child');
  const $summaryTotal = $('.summary-total span:last-child');

  if ($packImage.length) {
    $packImage.attr({
      'src': pack.imagen,
      'alt': `Imagen de ${pack.nombre}`
    });
  }

  if ($packTitle.length) {
    $packTitle.text(pack.nombre);
  }

  if ($packPrice.length) {
    $packPrice.text(`${pack.precio}€`);
  }

  if ($packList.length) {
    $packList.html(pack.incluye.map(item => `<li>${item}</li>`).join(''));
  }

  if ($packHighlights.length) {
    $packHighlights.text(pack.destinos);
  }

  if ($packDuration.length) {
    $packDuration.html(`<strong>Duración:</strong> ${pack.duracion}`);
  }

  // Actualizar resumen de compra con jQuery
  const gastosGestion = 15;
  const total = pack.precio + gastosGestion;

  if ($summaryPackName.length) {
    $summaryPackName.text(pack.nombre);
  }

  if ($summaryPackPrice.length) {
    $summaryPackPrice.text(`${pack.precio}€`);
  }

  if ($summaryTotal.length) {
    $summaryTotal.text(`${total}€`);
  }

  // Guardar pack en sessionStorage para validación
  sessionStorage.setItem('currentPack', JSON.stringify(pack));
});
