import Ember from 'ember';

export default Ember.Route.extend({
  camaras: Ember.inject.service(),

  setupController(controller, model) {
    controller.set('model', model);
    controller.set('capturas', []);
  }

});
