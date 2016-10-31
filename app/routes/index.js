import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    abrirPruebaDeCamaras() {
      this.transitionTo('camaras');
    }
  }
});
