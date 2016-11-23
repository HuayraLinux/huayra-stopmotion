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

  frames: [],       /* [ImageSources] from newer to older */
  cebollaLength: 3, /* Integer */
  cameraFrame: 0,   /* NO IMPLEMENTEADO (Integer) */
  alphaIn: 1,       /* Integer */
  alphaOut: 0,      /* Integer */

  framesCebolla: Ember.computed('cebollaLength', 'frames.[]', function() { /* Cambiar cuando exista el cursor de inserción */
    var cuadros = this.get('cebollaLength');
    return this.get('frames')
      .slice(-cuadros)
      .map((captura) => captura.href);
  }),

  /* Como framesCebolla es un computed no va a triggerear el evento automáticamente, así que voy a escuchar por él */
  cebolla: Ember.observer('cebollaLength', 'frames.[]', /*'framesCebolla',*/ 'alphaIn', 'alphaOut', 'cameraFrame', function() {
    var resources = this.get('resources');
    var width = this.get('width');
    var height = this.get('height');
    var frames = this.get('framesCebolla');
    var alphaIn = this.get('alphaIn');
    var alphaOut = this.get('alphaOut');

    var canvas = this.get('element');
    var ctx = canvas.getContext('2d');

    var loadFrames = Promise.all(frames.map(resources.loadImage));

    function dibujar_cebolla(imagenes) {
      ctx.clearRect(0, 0, width, height);
      imagenes.forEach((imagen, x) => {
        /* Interpolo linealmente:
         *   f(x) = ax + b
         *   f(0) = alphaIn
         *   f(imagenes.length) = alphaOut
         */
        var a = (alphaOut - 1) / (imagenes.length);
        var b = alphaIn;
        ctx.globalAlpha = a*x + b; /* x0 es el frame de la cámara*/
        ctx.drawImage(imagen, 0, 0);
      });
    }

    loadFrames.then(dibujar_cebolla);
  }),
});
