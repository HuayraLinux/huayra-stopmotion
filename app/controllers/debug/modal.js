import Ember from 'ember';

export default Ember.Controller.extend({
  remodal: Ember.inject.service(),

  actions: {
    abrirDialogoConfirmacion() {
      this.get('remodal').open('modal-confirmar-salir');
    },
    cuandoAceptaSalirSinGuardar() {
      alert("Ha aceptado salir sin guardar.");
    }
  }

});
