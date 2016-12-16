import Ember from 'ember';

export default Ember.Controller.extend({
  'camera-sharing': Ember.inject.service(),

  tick: Ember.computed(function() {
    return Date.now();
  }),

  onInit: Ember.on('init', function() {
    const INTERVAL = 100; /* 100ms */
    const invalidate = () => {
      this.notifyPropertyChange('tick');
      Ember.run.later(invalidate, INTERVAL);
    };

    Ember.run.later(invalidate, INTERVAL);
  })
});
