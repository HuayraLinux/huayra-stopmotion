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
    let contenido = `<video id="video" src="video-camara-fallback.mp4" loop="true" autoplay="true" muted="muted"></video>`;
    $(elementID).html(contenido);
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
   * Retorna una promesa que al cumplirse incluye un buffer de archivo PNG
   * en la escala real de la cámara.
   */
  capturarFrame() {
    //return new Promise ...
  }

});
