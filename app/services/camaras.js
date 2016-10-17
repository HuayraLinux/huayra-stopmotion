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
    return new Promise((success) => {
      this._inicializarCamaraDePrueba();
      console.log("Simulando una demora de 2 segundos en la inicialización del gestor de cámaras.");
      setTimeout(success, 2 * 1000);
    });
  },

  _inicializarCamaraDePrueba() {
    this.get('camaras').pushObject({id: 1, nombre: 'Cámara de prueba'});
  },


  /**
   * Permite cambiar la cámara actual.
   *
   * Retorna una promesa porque además de seleccionar la cámara tiene que
   * apagar la cámara anterior, encender la cámara nueva y apuntar todas las
   * propiedades a ese cámara.
   */
  seleccionarCamara(/*indice, elementID*/) {
    //return new Promise
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
