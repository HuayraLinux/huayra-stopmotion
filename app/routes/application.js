import Ember from 'ember';

export default Ember.Route.extend({
  camaras: Ember.inject.service(),

  afterModel() {
    return this.get('camaras').inicializar();
  }
});
