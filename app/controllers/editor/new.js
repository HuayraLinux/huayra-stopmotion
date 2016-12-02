import Ember from 'ember';

export default Ember.Controller.extend({
  electron: Ember.inject.service(),
  proyecto: Ember.inject.service(),

  contieneErrores: Ember.computed('model.nombre', 'model.ubicacion', 'model.errorRutaNoEscribible', 'model.errorProyectoExistente', function() {
    // El nombre se obtiene de eliminar todos los espacios.
    let nombre = this.get('model.nombre').replace(/^\s+|\s+$/g, '');
    let ubicacion = this.get('model.ubicacion');
    let errorRutaNoEscribible = this.get('model.errorRutaNoEscribible');
    let errorProyectoExistente = this.get('model.errorProyectoExistente');

    return (!nombre || !ubicacion || errorRutaNoEscribible || errorProyectoExistente);
  }),

  actions: {
    crearProyecto() {
      let nombre = this.get('model.nombre').trim();
      let ubicacion = this.get('model.ubicacion');

      this.get('proyecto').crearProyectoLaEnRuta(nombre, ubicacion).then(() => {
        this.transitionToRoute('editor.editar', encodeURIComponent(ubicacion));
      });

    },

    seleccionarNuevaUbicacion() {
      this.get('electron').seleccionarUnDirectorioEscribible().
        then((directorio) => {
          this.set('model.errorRutaNoEscribible', false);

          if (this.get('electron').existeProyectoEnLaRuta(directorio)) {
            this.set('model.errorProyectoExistente', true);
          } else {
            this.set('model.errorProyectoExistente', false);
            this.set('model.ubicacion', directorio);
          }

        }).
        catch((error) => {
          this.set('model.errorRutaNoEscribible', true);
          console.error(error);
        });
    }
  }

});
