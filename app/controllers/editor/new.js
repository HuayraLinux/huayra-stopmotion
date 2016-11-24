import Ember from 'ember';

export default Ember.Controller.extend({
  electron: Ember.inject.service(),

  contieneErrores: Ember.computed('model.nombre', 'model.ubicacion', function() {
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
    },

    seleccionarNuevaUbicacion() {
      this.get('electron').seleccionarUnDirectorio().then((directorio) => {
        this.set('model.ubicacion', directorio);
      });
    }
  }

});
