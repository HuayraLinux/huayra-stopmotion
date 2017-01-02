import Ember from 'ember';

export default Ember.Component.extend({
  sharingService: Ember.inject.service('webcam-sharing'),

  servers: Ember.computed.alias('sharingService.remoteInstances')
});
