import Ember from 'ember';


let Captura = Ember.Object.extend({
  href_miniatura: null,       // miniatura cuando se usa electron
  href: null,                 // ruta a la imagen cuando se usa electron
  data_miniatura: null,       // miniatura si NO se usa electron (chrome, firefox, tests ...)
  data: null,                 // imagen cuando NO se usa electro (chrome, firefox, tests ...)
});

export default Ember.Controller.extend({
  camaras: Ember.inject.service(),
  hayCamaraSeleccionada: Ember.computed.alias('camaras.camaraSeleccionada'),
  camaraSeleccionada: null,
  queryParams: ['camaraSeleccionada'],
  capturandoFoto: false,
  capturas: [],
  intervaloSeleccion: [0, 0],

  haySeleccion: Ember.computed('intervaloSeleccion', function() {
    let seleccion = this.get('intervaloSeleccion');

    return !(seleccion[0] === 0 && seleccion[1] === 0);
  }),

  actions: {
    seleccionarCamara(indice) {
      this.get('camaras').seleccionarCamara(indice, '#camara');
      this.set('camaraSeleccionada', indice);
    },

    apagarCamara() {
      this.get('camaras').desactivarCamaraSeleccionada('#camara');
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

    }
  }
});
