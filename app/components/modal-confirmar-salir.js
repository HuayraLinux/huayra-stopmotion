import Ember from 'ember';

export default Ember.Component.extend({
  remodal: Ember.inject.service(),

  actions: {
    cancelar() {
      this.get('remodal').close('modal-confirmar-salir');
    },
    aceptar() {
      this.sendAction('alAceptar');
      this.send('cancelar');
    }
  }
});
