import Ember from 'ember';


let Captura = Ember.Object.extend({
  href_miniatura: null,       // miniatura cuando se usa electron
  href: null,                 // ruta a la imagen cuando se usa electron
  data_miniatura: null,       // miniatura si NO se usa electron (chrome, firefox, tests ...)
  data: null,                 // imagen cuando NO se usa electro (chrome, firefox, tests ...)
});

export default Ember.Controller.extend({
  camaras: Ember.inject.service(),
  seleccionada: Ember.computed.alias('camaras.seleccionada'),
  capturandoFoto: false,
  capturas: [],

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
