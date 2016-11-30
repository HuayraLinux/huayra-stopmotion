import Ember from 'ember';
const Promise = Ember.RSVP.Promise;

export default Ember.Component.extend({
  camaras: Ember.inject.service(),
  resources: Ember.inject.service(),
  tagName: 'canvas',
  classNames: ['canvas-layer'],
  attributeBindings: ['width', 'height'],
  width: Ember.computed.alias('camaras.formato.width'),
  height: Ember.computed.alias('camaras.formato.height'),

  /* Del formulario vienen strings en lugar de números, reparar eso */
  config: {
    frames: [],       /* [ImageSources] from newer to older */
    cebollaLength: 3, /* Integer */
    cameraFrame: 0,   /* NO IMPLEMENTEADO (Integer) */
    alphaIn: 1,       /* Integer */
    alphaOut: 0       /* Integer */
  },

  framesCebolla: Ember.computed('config.cebollaLength', 'config.frames.[]', function() { /* Cambiar cuando exista el cursor de inserción */
    var cuadros = Number(this.get('config.cebollaLength'));
    return this.get('config.frames')
      .slice(-cuadros)
      .map((captura) => captura.href)
      .reverse();
  }),

  /* Como framesCebolla es un computed no va a triggerear el evento automáticamente, así que voy a escuchar por él */
  cebolla: Ember.observer('config.cebollaLength', 'config.frames.[]', /*'framesCebolla',*/ 'config.alphaIn', 'config.alphaOut', 'config.cameraFrame', function() {
    var resources = this.get('resources');
    var width = this.get('width');
    var height = this.get('height');
    var frames = this.get('framesCebolla');
    var alphaIn = Number(this.get('config.alphaIn'));
    var alphaOut = Number(this.get('config.alphaOut'));

    var canvas = this.get('element');
    var ctx = canvas.getContext('2d');

    var loadFrames = Promise.all(frames.map(resources.loadImage));

    function dibujar_cebolla(imagenes) {
      ctx.clearRect(0, 0, width, height);
      imagenes.forEach((imagen, x) => {
        /* Interpolo linealmente:
         *   f(x) = ax + b
         *   f(0) = alphaIn
         *   f(imagenes.length - 1) = alphaOut
         */
        var a = (alphaOut - alphaIn) / ((imagenes.length - 1) || 1); /* Si hay una imagen no se puede dividir por 0 */
        var b = alphaIn;
        ctx.globalAlpha = a*x + b; /* x0 es el frame de la cámara*/
        ctx.drawImage(imagen, 0, 0);
      });
    }

    loadFrames.then(dibujar_cebolla);
  }),
});
