import Ember from 'ember';

export default Ember.Route.extend({
  setupController(controller, model) {
    controller.activate();
    controller.set('model', model);
  }
});
