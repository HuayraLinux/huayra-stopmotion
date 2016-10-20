import Ember from 'ember';

export default Ember.Route.extend({
  camaras: Ember.inject.service(),

  beforeModel(params){
    let camaraSeleccionada = params.queryParams.camaraSeleccionada;

    return this.get('camaras').inicializar().then(() => {

      /* Si hay una cámara seleccionada previamente y almacenada en
       * los parámetros de la URL la activa directamente.
       *
       * Esto es bastante útil en el proceso de desarrollo de la aplicación,
       * donde se actualiza la ruta actual muchas veces.
       */
      if (camaraSeleccionada !== undefined && camaraSeleccionada !== null) {
        /*
         * TODO: para que la cámara se pueda activar hace falta que un elemento
         * del dom haga de anfitrión del video. Me gustaría evitar este
         * callback acá, pero no encontré otra forma de evitar esta dependencia
         * con el orden del runloop.
         */
        Ember.run.scheduleOnce('afterRender', this, function() {
          return this.get('camaras').seleccionarCamara(camaraSeleccionada, "#camara");
        });
      }

    });

  },

  setupController(controller, model) {
    controller.set('model', model);
    controller.set('capturas', []);
  }

});
