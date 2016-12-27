import Ember from 'ember';

export default Ember.Controller.extend({
  /* BORRAR ESTO Y ARMAR UN INITIALIZER */
  sharing: Ember.inject.service('webcam-sharing'),
  livereload: Ember.inject.service(),

  iniciar: Ember.on("init", function() {
    this.get('sharing');
    this.get('livereload');
  })
});
