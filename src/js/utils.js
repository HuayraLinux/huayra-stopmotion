window.onerror = function(e) {
  alert(e);
};

require('nw.gui').Window.get().setPosition('center');

window.mostrar_herramientas_de_desarrollo = function() {
    if (process.versions['nw-flavor'] == 'sdk') {
        var w = gui.Window.get();
        w.showDevTools();
    }
    else {
        alert("Herramientas de desarrollo no disponible. Debe ejecutar la aplicacion con el la version SDK de nw.js");
    }

};

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
};
