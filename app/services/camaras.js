import Ember from 'ember';
const Promise = Ember.RSVP.Promise;

export default Ember.Service.extend({
  camaras: [],
  camaraSeleccionada: null,

  cantidadDeCamaras: Ember.computed('camaras', function() {
    return this.get('camaras.length');
  }),

  /**
   * Inicializa el sistema de cámaras. Este método se llama al iniciar la
   * aplicación, y debería pre-cargar cualquier información para que el sistema
   * pueda comenzar a funcionar en el resto de la aplicación.
   */
  inicializar() {
    this.set('camaraSeleccionada', null);

    return new Promise((success) => {
      this._inicializarCamaraDePrueba();
      console.log("Simulando una demora de 2 segundos en la inicialización del gestor de cámaras.");
      setTimeout(success, 2 * 1000);
    });
  },

  _inicializarCamaraDePrueba() {
    this.get('camaras').pushObject({id: 1, nombre: 'Cámara de prueba', camaraReal: false});
  },


  /**
   * Permite cambiar la cámara actual.
   *
   * Retorna una promesa porque además de seleccionar la cámara tiene que
   * apagar la cámara anterior, encender la cámara nueva y apuntar todas las
   * propiedades a ese cámara.
   */
  seleccionarCamara(indice, elementID) {

    if (!this.get('camaras')[indice]) {
      throw new Error("No se puede encontrar la cámara índice " + indice);
    }

    let camaraSeleccionada = this.get('camaras')[indice];

    if (camaraSeleccionada.camaraReal === false) {
      this._activarCamaraDePrueba(elementID);
    } else {
      throw new Error("No se implementó una forma de inicializar esta cámara.");
    }

    this.set('camaraSeleccionada', camaraSeleccionada);
  },

  _activarCamaraDePrueba(elementID) {
    let contenido = `<video id="video" src="video-camara-fallback.mp4" loop="true" autoplay="true" playback-rate=0.1 muted="muted"></video>`;
    $(elementID).html(contenido);
    document.getElementById("video").playbackRate = 0.1;
  },


  /**
   * Obtener listado de formatos que soporta la cámara seleccionada.
   */
  obtenerFormatos() {

  },

  /**
   * Define el formato a usar por la cámara actual.
   */
  definirFormato(/*indice*/) {

  },


  /**
   * Retorna todos los controles para la cámara actual.
   *
   * El resultado de este método es variable, porque depende del modelo
   * de webcam y de los drivers utilizados. Pero a grandes razgos debería
   * respetar este formato de datos:
   *
   *  [
   *    {
   *      id: 'Contrast',
   *      min: 0,
   *      max: 100,
   *      step: 10,
   *      type: 'int',
   *      menu: []
   *    }
   *  ]
   *
   */
  obtenerControles() {

  },

  /**
   * Retorna el valor de un control en particular.
   */
  obtenerValorDeControl(/*idControl*/) {

  },

  /**
   * Definr el valor de un control en particular.
   */
  definirValorDeControl(/*idControl, valor*/) {

  },

  desactivarCamaraSeleccionada(elementID) {
    $(elementID).html("desactivada...");
    this.set('camaraSeleccionada', null);
  },

  /**
   * Inicia la captura de uno solo frame.
   *
   * Retorna una promesa que al cumplirse incluye la captura de pantalla
   * en varios formatos, algo así:
   *
   *     {
   *        captura:          base64 en formato png de la captura completa
   *        miniatura:        base64 en formato png de la miniatura
   *        ruta_captura:     path de sistema absoluto a la captura en el disco (solo electron)
   *        ruta_miniatura:   path de sistema absoluto a la miniatura (solo electron)
   *     }
   */
  capturarFrame() {
    let camaraSeleccionada = this.get('camaraSeleccionada');

    return new Promise((success, reject) => {

      if (camaraSeleccionada.camaraReal === false) {
        let capturas = this._obtener_capturas_desde_camara_falsa();

        let nombre_sugerido = this._obtener_numero_aleatorio(100000, 999999);

        // Solo sobre electron intenta guardar las imagenes en archivos:
        if (inElectron) {
          Promise.all([
            this._guardar_base64_en_archivo(capturas.captura, `${nombre_sugerido}.png`),
            this._guardar_base64_en_archivo(capturas.miniatura, `${nombre_sugerido}_miniatura.png`),
          ]).then((resultados) => {
            capturas.ruta_captura = resultados[0];
            capturas.ruta_miniatura = resultados[1];
            success(capturas);
          });
        } else {
          capturas.ruta_captura = null;
          capturas.ruta_miniatura = null;
          success(capturas);
        }

      } else {
        reject("No se implementó la captura sobre una camara real");
      }

    });

  },

  /**
   * Retorna un diccionaro con dos capturas de pantalla desde la cámara falsa.
   *
   * Una captura corresponde a lo que tomó exactamente desde la cámara, y
   * otra captura es la miniatura.
   *
   * Los campos son {captura, miniatura}, las dos en formato base64.
   */
  _obtener_capturas_desde_camara_falsa() {

    var video  = document.getElementById('video'); // TODO: debería conocer el id del elemento a capturar.
    var canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    let captura = canvas.toDataURL('image/png');


    var canvasMiniatura = document.createElement('canvas');
    canvasMiniatura.width  = video.videoWidth / 5;
    canvasMiniatura.height = video.videoHeight / 5;

    var ctxMiniatura = canvasMiniatura.getContext('2d');
    ctxMiniatura.drawImage(video, 0, 0, canvasMiniatura.width, canvasMiniatura.height);
    let capturaMiniatura = canvasMiniatura.toDataURL('image/png');

    return {captura, miniatura: capturaMiniatura};

  },

  /**
   * Genera un archivo en formato .png y lo guarda en el disco.
   *
   * Espera como argumento una imagen en formato base64 de tipo png y el
   * nombre del archivo sugerido (en un path relativo o absoluto).
   *
   * La función retornará la ruta absoluta a la imagen en el sistema.
   */
  _guardar_base64_en_archivo(datos_base_64, nombre_de_archivo) {
    return new Promise((success, reject) => {
      var base64Data = datos_base_64.replace(/^data:image\/png;base64,/, "");
      let path = requireNode('path');

      requireNode("fs").writeFile(nombre_de_archivo, base64Data, 'base64', function(err) {
        if (err) {
          reject(err);
        } else {
          success(path.resolve(nombre_de_archivo));
        }
      });

    });
  },

  /*
   * Retorna un número aleatorio entre dos valores.
   */
  _obtener_numero_aleatorio(min, max) {
    let valor = Math.floor(Math.random() * (max - min) + min);
    return `${valor}`;
  }

});
