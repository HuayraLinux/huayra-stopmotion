import Ember from 'ember';
import { preview } from '../mlt-integration';

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
    frames: [],      /* [ImageSources] from newer to older */
    futureFrames: 0, /* Integer */
    pastFrames: 3,   /* Integer */
    cameraFrame: 0,  /* Integer */
    alpha: 0.2,      /* Float */
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
      const [a, b] = this.get('intervaloSeleccion');

      const tamanioSeleccion = b - a;

      this.get('capturas').splice(a, tamanioSeleccion);
      this.get('capturas').arrayContentDidChange(a, tamanioSeleccion, 0);

      /* Reajustar el cursor */
      const cursor = this.get('cursor');

      /* Si el cursor está antes de los cambios no hago nada
       * Si está después le resto el tamaño de la seleción
       * Si está en el medio lo dejo en el medio
       */
      if(cursor >= b) {
        this.set('cursor', cursor - tamanioSeleccion);
      } else if(cursor <= a) {
        this.set('cursor', a);
      }

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

        const cursor = this.get('cursor');

        this.get('capturas').splice(cursor, 0, Captura.create(data));
        this.get('capturas').arrayContentDidChange(cursor, 0, 1);

        this.set('cursor', this.get('cursor') + 1);

      }, (error) => {
        this.set('capturandoFoto', false);
        console.error(error);
        alert("ERROR" + error);
      });
    },

    /* TODO: Mejorar esto */
    previsualizar() {
      /* https://github.com/feross/mediasource */
      const seleccion = this.get('intervaloSeleccion');
      const path = this.get('pathProyecto');
      const video = preview(seleccion, path, 24, console.log);

      video.loop = true;

      document.body.appendChild(video);
    }
  }
});
