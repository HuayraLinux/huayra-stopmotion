import Ember from 'ember';

export default Ember.Route.extend({
  electron: Ember.inject.service(),

  setupController(controller) {
    controller.set('inElectron', inElectron);
  },

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
    abrirUnProyectoExistente() {
      this.get('electron').seleccionarUnProyectoConDialogoDeSistema().then((ubicacion) => {
        this.transitionTo('editor.editar', encodeURIComponent(ubicacion));
      }, (error) => {
        if (error) {
          alert("ERROR " + error);
        } else {
          console.warn("El usuario ha cancelado el dialogo.");
        }
      });
    }
  }
});
