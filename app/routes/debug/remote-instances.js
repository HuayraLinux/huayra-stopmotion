import Ember from 'ember';

export default Ember.Route.extend({
  sharing: Ember.inject.service('webcam-sharing'),

  activate() {
    this.get('sharing').start();
  },

  deactivate() {
    this.get('sharing').stop();
  }
});
