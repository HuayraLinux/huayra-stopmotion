import Ember from 'ember';
const Promise = Ember.RSVP.Promise;

export default Ember.Service.extend({

  inicializar() {
    return new Promise((success) => {
      console.log("Simulando inicialización de gestor de cámaras.");
      setTimeout(success, 2 * 1000);
    });
  }

});
