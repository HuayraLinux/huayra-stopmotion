import Ember from 'ember';

export default Ember.Service.extend({
  datos: {},

  crearProyectoLaEnRuta(nombre, ubicacion) {
    let fs = requireNode('fs');
    let path = requireNode('path');
    let ruta_completa = path.join(ubicacion, 'proyecto.huayra-stopmotion');

    let datos = {
      nombre: nombre,
      version: "0.2",
      cuadros: []
    };

    return new Ember.RSVP.Promise((success, reject) => {

      fs.writeFile(ruta_completa, JSON.stringify(datos, null, 4), function(err) {

        if (err) {
          reject(err);
        } else {
          console.log("Se creó el archivo: " + ruta_completa);
          success(ruta_completa);
        }

      });

    });
  },

  /**
   * Carga todos los datos del proyecto desde un archivo.
   *
   * La función carga los datos en la propiedad 'datos' pero retorna
   * una promesa para que el usuario pueda
   */
  cargarProyectoDesdeLaRuta(ubicacion) {
    let fs = requireNode('fs');
    let path = requireNode('path');
    let ruta_completa = path.join(ubicacion, 'proyecto.huayra-stopmotion');

    return new Ember.RSVP.Promise((success, reject) => {

      fs.readFile(ruta_completa, (error, data) => {

        if (error) {
          reject(error);
        } else {
          this.set('datos', JSON.parse(data));
          success();
        }

      });

    });
  }

});
