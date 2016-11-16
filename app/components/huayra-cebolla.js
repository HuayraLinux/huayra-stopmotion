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

  frames: [],     /* [ImageSources] from newer to older */
  cameraFrame: 0, /* NO IMPLEMENTEADO (Integer) */
  alphaIn: 1,     /* Integer */
  alphaOut: 0,    /* Integer */

  cebolla: Ember.observer('frames', 'alphaIn', 'alphaOut', function() {
    var resources = this.get('resources');
    var width = this.get('width');
    var height = this.get('height');
    var frames = this.get('frames');
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
