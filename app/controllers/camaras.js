import Ember from 'ember';

export default Ember.Controller.extend({
  camaras: Ember.inject.service(),
  hayCamaraSeleccionada: Ember.computed.alias('camaras.camaraSeleccionada'),
  camaraSeleccionada: null,
  queryParams: ['camaraSeleccionada'],

  actions: {
    seleccionarCamara(indice) {
      this.get('camaras').seleccionarCamara(indice, '#camara');
      this.set('camaraSeleccionada', indice);
    },

    apagarCamara() {
      this.get('camaras').desactivarCamaraSeleccionada('#camara');
    }
  }
});
