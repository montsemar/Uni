// JavaScript para cargar y mostrar la imagen de perfil del usuario 

// Función para recuperar imagen desde localStorage con jQuery
const handleProfileLoad = async () => {
  const $profileInfo = $(".profile-info");
  if ($profileInfo.length === 0) return;
  
  let $img = $profileInfo.find(".profile-pic");
  if ($img.length === 0) {
    // Si no existe el <img>, crear uno con jQuery
    $img = $('<img class="profile-pic">');
    $profileInfo.prepend($img);
  }
  
  // 1) usuarioActual.imagen -> obtener valor de localStorage con esa clave
  // 2) fallback a imagen por defecto

  const usuario = JSON.parse(localStorage.getItem("usuarioActual") || "null");

  try {
    if (usuario) {
      if (usuario.imagen) {
        const data = localStorage.getItem(usuario.imagen);
        if (data) {
          $img.attr('src', data);
          return;
        }
      }
    }
    // Imagen por defecto
    $img.attr('src', "images/ana.png");
  } catch (e) {
    console.error("Error al cargar la imagen de perfil:", e);
    $img.attr('src', "images/ana.png");
  }
};

// Usar jQuery ready y load
$(window).on('load', handleProfileLoad);
