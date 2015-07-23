window.onerror = function(e) {
  alert(e);
};

window.mostrar_herramientas_de_desarrollo = function() {
  var w = gui.Window.get();
  w.showDevTools();
}

window.mostrar = function(elemento, ruta_a_imagen) {
  /* Se ejecuta cuando la imagen del timeline está lista para ser mostrada. */

  setTimeout(function() {
    elemento.classList.remove('img-invisible');
    elemento.classList.add('img-visible');
    elemento.src = ruta_a_imagen;

    try {
      elemento.parentElement.classList.remove('cargando');
    } catch(e) {
      console.error(e);
    }
  }, 2000);
}
