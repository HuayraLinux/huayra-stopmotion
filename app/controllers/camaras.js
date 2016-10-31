import Ember from 'ember';


let Captura = Ember.Object.extend({
  href_miniatura: null,       // miniatura cuando se usa electron
  href: null,                 // ruta a la imagen cuando se usa electron
  data_miniatura: null,       // miniatura si NO se usa electron (chrome, firefox, tests ...)
  data: null,                 // imagen cuando NO se usa electro (chrome, firefox, tests ...)
});

function rgb2rgba(rgb, rgba) {
  var length = rgb.length / 3; /* RGB son 3 bytes por pixel */

  for(var i = 0; i < length; i++) {
    rgba[i * 4 + 0] = rgb[i * 3 + 0]; /* Rojo  */
    rgba[i * 4 + 1] = rgb[i * 3 + 1]; /* Verde */
    rgba[i * 4 + 2] = rgb[i * 3 + 2]; /* Azul  */
    rgba[i * 4 + 3] = 255; /* Alpha: la imagen es opaca */
  }

  return rgba;
}

export default Ember.Controller.extend({
  camaras: Ember.inject.service(),
  camaraSeleccionada: Ember.computed.alias('camaras.camaraSeleccionada'),
  capturandoFoto: false,
  capturas: [],
  width: Ember.computed('camaraSeleccionada',function() {
    return this.get('camaraSeleccionada').configGet().width;
  }),
  height: Ember.computed('camaraSeleccionada',function() {
    return this.get('camaraSeleccionada').configGet().height;
  }),

  init: Ember.on('init', function() {
    this.get('camaras').on('frame', (frame, width, height) => {
      var camara = document.getElementById('camara');
      var ctx = camara.getContext('2d');
      var imageData = ctx.createImageData(width, height);

      rgb2rgba(frame, imageData.data); /* Modifico el buffer de data */

      ctx.putImageData(imageData, 0, 0);
    });
  }),

  actions: {
    seleccionarCamara(indice) {
      this.get('camaras').seleccionarCamara(indice);
    },

    capturar() {
      this.set('capturandoFoto', true);

      this.get('camaras').capturarFrame().then((fotos) => {
        this.set('capturandoFoto', false);
        let data = {};

        if (inElectron) {
          data.href_miniatura = fotos.ruta_miniatura;
          data.href = fotos.ruta_captura;
        } else {
          data.data_miniatura = fotos.miniatura;
          data.data = fotos.captura;
        }

        this.get('capturas').pushObject(Captura.create(data));

      }, (error) => {
        this.set('capturandoFoto', false);
        alert(error);
      });
    }
  }
});
