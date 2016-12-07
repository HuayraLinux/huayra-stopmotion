import Ember from 'ember';
import { execPreview as preview } from '../mlt-integration';

let Captura = Ember.Object.extend({
  href_miniatura: null,       // miniatura cuando se usa electron
  href: null,                 // ruta a la imagen cuando se usa electron
  data_miniatura: null,       // miniatura si NO se usa electron (chrome, firefox, tests ...)
  data: null,                 // imagen cuando NO se usa electro (chrome, firefox, tests ...)
});

function copyOnChange(what, where) {
  return Ember.on('init', Ember.observer(what, function() {
    return this.set(where, this.get(what));
  }));
}

export default Ember.Controller.extend({
  camaras: Ember.inject.service(),
  seleccionada: Ember.computed.alias('camaras.seleccionada'),
  capturandoFoto: false,
  capturas: [],
  intervaloSeleccion: [0, 0],
  cursor: 0, /* A IMPLEMENTAR, LO MODIFICA EL TIMELINE */

  copiarCapturas: copyOnChange('capturas', 'cebolla.frames'),
  copiarCursor: copyOnChange('cursor', 'cebolla.cameraFrame'),

  cebolla: {
    frames: [],       /* alias('capturas') */
    cebollaLength: 3, /* Integer */
    alphaIn: 0.2,     /* Integer */
    alphaOut: 0.2,    /* Integer */
    cameraFrame: 0    /* alias('cursor') | NO IMPLEMENTADO | Integer */
  },

  grilla: {
    filas: 3,
    columnas: 3,
    lineWidth: 3,
    style: 'black',
    dashFormat: []
  },

  /* Aplica un changeset */
  aplicar(cambios) {
    cambios.save();
  },

  haySeleccion/* No, no llegamos a rusia */: Ember.computed('intervaloSeleccion', function() {
    let seleccion = this.get('intervaloSeleccion');

    return !(seleccion[0] === 0 && seleccion[1] === 0);
  }),

  actions: {
    seleccionarCamara(indice) {
      this.get('camaras').seleccionarCamara(indice);
    },

    eliminarCuadrosSeleccionados() {
      let a = this.get('intervaloSeleccion')[0];
      let b = this.get('intervaloSeleccion')[1];
      let total = this.get('capturas.length');

      let primer_parte = this.get('capturas').slice(0, a-1);
      let segunda_parte = this.get('capturas').slice(b, total);

      this.set('capturas', primer_parte.concat(segunda_parte).slice());

      this.set('intervaloSeleccion', [0, 0]);
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
    },

    previsualizar() {
      const seleccion = this.get('intervaloSeleccion');
      const frames = this.get('capturas').slice(seleccion[0], seleccion[1]);
      /* Esto es una prueba, vamos a mandarle 15 fps */
      preview(frames, 15, true, (frame, porcentaje) => console.log('Preview: %s%% [frame: %s]', porcentaje, frame));
    }
  }
});
