import Ember from 'ember';

let Captura = Ember.Object.extend({
  href_miniatura: null,       // miniatura cuando se usa electron
  href: null,                 // ruta a la imagen cuando se usa electron
  data_miniatura: null,       // miniatura si NO se usa electron (chrome, firefox, tests ...)
  data: null,                 // imagen cuando NO se usa electro (chrome, firefox, tests ...)
});

export default Ember.Controller.extend({
  proyecto: Ember.inject.service(),
  camaras: Ember.inject.service(),

  capturas: [],
  intervaloSeleccion: [0, 0],
  capturandoFoto: false,

  haySeleccion: Ember.computed('intervaloSeleccion', function() {
    let seleccion = this.get('intervaloSeleccion');

    return !(seleccion[0] === 0 && seleccion[1] === 0);
  }),

  actions: {

    guardar() {
      let cuadros = this.get("capturas");
      this.get('proyecto').guardarProyectoEnLaRuta(cuadros);
    },

    eliminarCuadrosSeleccionados() {
      let a = this.get('intervaloSeleccion')[0];
      let b = this.get('intervaloSeleccion')[1];

      let primer_parte = this.get('capturas').slice(0, a);
      let segunda_parte = this.get('capturas').slice(b);

      this.set('capturas', primer_parte.concat(segunda_parte));

      this.set('intervaloSeleccion', [0, 0]);
    },

    capturar() {
      this.set('capturandoFoto', true);

      this.get('camaras').capturarFrame(this.get('model.ubicacion')).then((fotos) => {
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
        console.error(error);
        alert(error);
      });
    },
  }
});
