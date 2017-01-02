import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  url: Ember.computed('server', function() {
    const server = this.get('server');
    return `http://${server.addresses[0]}:${server.port}`;
  }),

  webcams: Ember.computed(function() {
    Ember.run.later(() => this.notifyPropertyChange('webcams'), 10000);

    return DS.PromiseArray.create({
      promise: $.getJSON(`${this.get('url')}/list`)
    });
  })
});
