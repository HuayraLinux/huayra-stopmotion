import Ember from 'ember';

export default Ember.Route.extend({
  proyecto: Ember.inject.service(),

  model(params) {
    let ubicacion = decodeURIComponent(params.ubicacion);

    return new Ember.RSVP.Promise((success, reject) => {

      this.get('proyecto').cargarProyectoDesdeLaRuta(ubicacion).then((data) => {
        success({data: data, ubicacion: ubicacion});
      }, reject);

    });

  },

  setupController(controller, model) {
    controller.set('model', model);
    controller.set('cursor', model.data.cuadros.length);
    controller.set('capturas', model.data.cuadros);
  },

  actions: {
    cerrarElProyecto() {
      this.transitionTo('index');
    }
  }
});
