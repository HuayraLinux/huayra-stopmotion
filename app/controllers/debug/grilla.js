import Ember from 'ember';

export default Ember.Controller.extend({
  grilla: {
    filas: 3,
    columnas: 3,
    lineWidth: 3,
    style: 'black',
    dashFormat: []
  },

  guardar(changes) {
    changes.save();
  }
});
