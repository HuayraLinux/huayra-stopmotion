import Ember from 'ember';

export default Ember.Route.extend({
  afterModel(model) {
    model.ubicacion = decodeURIComponent(model.ubicacion);
  },

  actions: {
    cerrarElProyecto() {
      this.transitionTo('index');
    }
  }
});
