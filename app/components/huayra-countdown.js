import Ember from 'ember';

export default Ember.Component.extend({
  interval: 1,
  secondsLeft: 1,
  timer: null,

  seconds: Ember.computed('secondsLeft', function() {
    return Math.floor(this.get('secondsLeft') % 60);
  }),

  minutes: Ember.computed('secondsLeft', function() {
    return Math.floor(this.get('secondsLeft') / 60 % 60);
  }),

  hours: Ember.computed('secondsLeft', function() {
    return Math.floor(this.get('secondsLeft') / 60 / 60);
  }),

  init() {
    this._super(...arguments);
    this.set('secondsLeft', this.get('interval') / 1000);
    this.setTimer();
  },

  didUpdateAttrs() {
    Ember.run.cancel(this.get('timer'));
    this.set('secondsLeft', this.get('interval') / 1000);
    this.setTimer();
  },

  willDestroy() {
    Ember.run.cancel(this.get('timer'));
  },

  aSecondPassed() {
    const secondsLeft = this.decrementProperty('secondsLeft');

    if(secondsLeft < 0) {
      this.set('secondsLeft', this.get('interval') / 1000);
    }
    this.setTimer();
  },

  setTimer() {
    const timer = Ember.run.later(this, this.aSecondPassed, 1000);
    this.set('timer', timer);
  }
});
