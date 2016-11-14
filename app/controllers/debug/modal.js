import Ember from 'ember';

export default Ember.Controller.extend({
  remodal: Ember.inject.service(),
  electron: Ember.inject.service(),

  activate() {
    this.get('electron').on('onClose', () => {
      this.get('remodal').open('modal-confirmar-salir');
    });
  },

  deactivate() {
    console.log("deactivate");
  },

  actions: {
    
    abrirDialogoConfirmacion() {
      this.get('remodal').open('modal-confirmar-salir');
    },

    cuandoAceptaSalirSinGuardar() {
      this.get('electron').forceQuit();
    }
  }

});
