import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  disableClose() {
    window.onbeforeunload = (e) => {
      console.log(e);
      this.trigger('onClose');
      return true;
    };
  },

  enableClose() {
    window.onbeforeunload = () => {
      return undefined;
    };
  },

  forceQuit() {
    this.enableClose();
    window.close();
  },

  /*
   * Abre un cuadro de dialogo para seleccionar un directorio que la aplicación
   * pueda escribir.
   *
   * La función retorna una promesa con la ruta seleccionada o un error si el
   * directorio no se puede escribir.
   */
  seleccionarUnDirectorioEscribible() {
    return new Ember.RSVP.Promise((success, reject) => {
      let fs = requireNode('fs');
      let electron = requireNode('electron');
      let opciones = {properties: ['openDirectory']};

      electron.remote.dialog.showOpenDialog(opciones, (directorio) => {

        // Verifica que se pueda escribir sobre el directorio que eleligió el usuario.
        fs.access(directorio[0], fs.W_OK, function(err) {

          if (err) {
            reject("Tiene que elegir un directorio que se pueda escribir.");
          } else {
            success(directorio[0]);
          }

        });

      });
    });
  },

  /*
   * Verifica sincrónicamente si existe un proyecto dentro de un directorio.
   */
  existeProyectoEnLaRuta(directorio) {
      let fs = requireNode('fs');
      let path = requireNode('path');
      let ruta_completa = path.join(directorio, 'proyecto.huayra-stopmotion');

      return fs.existsSync(ruta_completa);
  }

});
