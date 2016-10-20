import Ember from 'ember';

export default Ember.Controller.extend({
  camaras: Ember.inject.service(),
  hayCamaraSeleccionada: Ember.computed.alias('camaras.camaraSeleccionada'),
  camaraSeleccionada: null,
  queryParams: ['camaraSeleccionada'],
  capturandoFoto: false,
  capturas: [],

  actions: {
    seleccionarCamara(indice) {
      this.get('camaras').seleccionarCamara(indice, '#camara');
      this.set('camaraSeleccionada', indice);
    },

    apagarCamara() {
      this.get('camaras').desactivarCamaraSeleccionada('#camara');
    },

    capturar() {
      this.set('capturandoFoto', true);

      this.get('camaras').capturarFrame().then((fotos) => {
        this.set('capturandoFoto', false);
        console.log("Desde el controlador llegan ", fotos);

        this.get('capturas').pushObject({href: fotos.ruta_miniatura});


      }, (error) => {
        this.set('capturandoFoto', false);
        alert(error);
      });

    }
  }
});
