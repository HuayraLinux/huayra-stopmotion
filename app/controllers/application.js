import Ember from 'ember';

export default Ember.Controller.extend({
  livereload: Ember.inject.service(),

  iniciar: Ember.on("init", function() {
    this.get('livereload');
  })
});
