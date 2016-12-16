import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    abrirPruebaDeCamaras() {
      this.transitionTo('camaras');
    },
    abrirPruebas() {
      this.transitionTo('debug.index');
    },
    crearUnProyectoNuevo() {
      this.transitionTo('editor.new');
    },
    abrirPanelCompartir() {
      this.transitionTo('compartir-webcam');
    }
  }
});
