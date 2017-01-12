import Ember from 'ember';
const VERSION_DE_ARCHIVO = "0.2";

let ProyectoServiceParaElectron = Ember.Service.extend({
  datos: {},
  ruta_al_archivo_de_proyecto: null,
  nombre: null,

  crearProyectoLaEnRuta(nombre, ubicacion) {
    let fs = requireNode('fs');
    let path = requireNode('path');
    let ruta_completa = path.join(ubicacion, 'proyecto.huayra-stopmotion');

    let datos = this._crear_formato_de_archivo(nombre, []);

    return new Ember.RSVP.Promise((success, reject) => {

      fs.writeFile(ruta_completa, JSON.stringify(datos, null, 4), (err) => {

        if (err) {
          reject(err);
        } else {
          console.log("Se creó el archivo: " + ruta_completa);
          console.log("Se almacenó la ruta en el servicio de Proyecto");

          this.set('nombre', nombre);
          this.set('ruta_al_archivo_de_proyecto', ruta_completa);

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
          let datosJSON = this.set('datos', JSON.parse(data));

          /* Ajusta las rutas para que sean absolutas para la aplicación. */
          datosJSON.cuadros = datosJSON.cuadros.map((cuadro) => {
            return {
              href: path.join(ubicacion, cuadro.href),
              href_miniatura: path.join(ubicacion, cuadro.href_miniatura)
            };
          })

          this.set('nombre', datosJSON.nombre);
          this.set('ruta_al_archivo_de_proyecto', ruta_completa);
          this.set('datos', datosJSON);

          success(datosJSON);
        }

      });

    });
  },

  guardarProyectoEnLaRuta(cuadros) {
    let ruta = this.get('ruta_al_archivo_de_proyecto');
    let nombre = this.get('nombre');
    const path = requireNode('path');
    const fs = requireNode('fs');

    let cuadrosRelativos = cuadros.map((cuadro) =>  {
      return {
        href_miniatura: path.basename(cuadro.href_miniatura),
        href: path.basename(cuadro.href)
      };
    });

    let datos = this._crear_formato_de_archivo(nombre);
    datos.cuadros = cuadrosRelativos;


    return new Ember.RSVP.Promise((success, reject) => {

      fs.writeFile(ruta, JSON.stringify(datos, null, 4), (err) => {

        if (err) {
          reject(err);
        } else {

          console.log("Se guardó el archivo: " + ruta);
          this.set('ruta_al_archivo_de_proyecto', ruta);

          success(ruta);
        }

      });

    });

  },

  _crear_formato_de_archivo(nombre, cuadros) {
    let datos = {
      nombre: nombre,
      version: VERSION_DE_ARCHIVO,
      cuadros: cuadros
    };

    return datos;
  },

  obtenerUbicacion() {
    return this.get('ruta_al_archivo_de_proyecto');
  }


});


const ProyectoServiceParaTestBrowser = ProyectoServiceParaElectron.extend({

  crearProyectoLaEnRuta(/* nombre, ubicacion */) {
    return new Ember.RSVP.Promise((success) => {
      success("Ejecutando desde electron ...");
    });
  },

  cargarProyectoDesdeLaRuta(/* ubicacion */) {
    return new Ember.RSVP.Promise((success /* , reject */) => {
      this.set('datos', this._crear_formato_de_archivo("demo-desde-tests", []));
      success();
    });
  }

});

let servicioAExportar;

if (inElectron) {
  servicioAExportar = ProyectoServiceParaElectron;
} else {
  servicioAExportar = ProyectoServiceParaTestBrowser;
}

export default servicioAExportar;
