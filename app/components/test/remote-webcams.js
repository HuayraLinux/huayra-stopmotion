import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  url: Ember.computed('server', function() {
    const server = this.get('server');
    /*const ipv4 = /([0-9]{1,3}\.){3}[0-9]{1,3}/;*/
    return `${server.host}:${server.port}`;
  }),

  webcams: Ember.computed(function() {
    Ember.run.later(() => this.notifyPropertyChange('webcams'), 10000);

    return DS.PromiseArray.create({
      promise: $.getJSON(`http://${this.get('url')}/list`)
    });
  })
});
