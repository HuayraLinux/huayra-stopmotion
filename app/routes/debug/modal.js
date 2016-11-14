import Ember from 'ember';

export default Ember.Route.extend({
  electron: Ember.inject.service(),
  remodal: Ember.inject.service(),

  setupController(controller, model) {
    controller.set('model', model);
    controller.activate();
  },

  activate() {
    this.get('electron').disableClose();
  },

  deactivate() {
    this.get('electron').enableClose();
    this.get('controller').deactivate();
  }
});
