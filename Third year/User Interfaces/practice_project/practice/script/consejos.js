// JavaScript para la funcionalidad de el formulario de consejos

$(document).ready(() => {
  const STORAGE_KEY = "consejos";
  let consejos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  const $listaConsejos = $(".latest-tips .lista");
  // buscar el <form> dentro de .tip-form con jQuery
  const $formulario = $(".latest-tips .tip-form form").length 
    ? $(".latest-tips .tip-form form") 
    : $(".latest-tips .tip-form");

  if ($listaConsejos.length === 0 || $formulario.length === 0) return;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consejos));
  }

  function render() {
    $listaConsejos.empty();
    if (!Array.isArray(consejos) || consejos.length === 0) {
      $listaConsejos.html(`
        <a href="m">Equipaje para el monzón asiático</a>
        <a href="m">Presupuesto para Europa del Este</a>
        <a href="m">Apps imprescindibles para viajeros</a>
      `);
      return;
    }
    // ordenar por createdAt descendente y mostrar hasta 3
    const recientes = consejos.slice().sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 3);
    $.each(recientes, (index, c) => {
      const $a = $('<a></a>')
        .attr('href', `tip.html?id=${encodeURIComponent(c.id)}`)
        .attr('title', c.description)
        .text(c.title);
      $listaConsejos.append($a);
    });
  }

  // manejo del submit con jQuery
  const $formEl = $formulario.is("form") ? $formulario : $formulario.find("form");
  if ($formEl.length === 0) {
    render();
    return;
  }

  $formEl.on("submit", (e) => {
    e.preventDefault();

    const $titleEl = $formEl.find(".tip-title");
    const $descEl = $formEl.find(".tip-description");
    const title = ($titleEl.val() || "").trim();
    const description = ($descEl.val() || "").trim();

    const errors = [];
    if (title.length < 15) {
        errors.push("El título debe tener al menos 15 caracteres.");
    }
    if (description.length < 30) {
        errors.push("La descripción debe tener al menos 30 caracteres.");
    }
    if (errors.length) {
      Modal.errors(errors, "Error en el consejo");
      return;
    }

    const nuevoConsejo = {
      id: Date.now(),
      createdAt: Date.now(),
      title,
      description
    };

    // añadir al inicio con unshift para que sea el más reciente
    consejos.unshift(nuevoConsejo);
    save();

    // renderizar últimos 3 consejos y limpiar formulario con jQuery
    render();
    $titleEl.val("");
    $descEl.val("");
    $titleEl.focus();
  });

  // cargar y mostrar consejos
  render();
});
