import Ember from 'ember';

export default Ember.Route.extend({
  proyecto: Ember.inject.service(),

  afterModel(model) {
    model.ubicacion = decodeURIComponent(model.ubicacion);
    return this.get('proyecto').cargarProyectoDesdeLaRuta(model.ubicacion);
  },

  setupController(controller, model) {
    controller.set('model', model);
    controller.set('cuadros', this.get('proyecto.datos.cuadros'));
  },

  actions: {
    cerrarElProyecto() {
      this.transitionTo('index');
    }
  }
});
