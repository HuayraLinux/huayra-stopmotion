import Ember from 'ember';

export default Ember.Controller.extend({

  contieneErrores: Ember.computed('model.nombre', function() {
    // El nombre se obtiene de eliminar todos los espacios.
    let nombre = this.get('model.nombre').replace(/^\s+|\s+$/g, '');
    let ubicacion = this.get('model.ubicacion');

    return (!nombre || !ubicacion);
  }),

  actions: {
    crearProyecto() {
      //let nombre = this.get('model.nombre').trim();

      let ubicacion = this.get('model.ubicacion');

      this.transitionToRoute('editor.editar', encodeURIComponent(ubicacion));
    }
  }

});
