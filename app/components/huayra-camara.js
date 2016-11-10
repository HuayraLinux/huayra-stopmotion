import Ember from 'ember';
const Promise = Ember.RSVP.Promise;

/* Copia de services/camaras.js:42 */
function rgb2rgba(rgb, rgba) {
  var length = rgb.length / 3; /* RGB son 3 bytes por pixel */

  for(var i = 0; i < length; i++) {
    rgba[i * 4 + 0] = rgb[i * 3 + 0]; /* Rojo  */
    rgba[i * 4 + 1] = rgb[i * 3 + 1]; /* Verde */
    rgba[i * 4 + 2] = rgb[i * 3 + 2]; /* Azul  */
    rgba[i * 4 + 3] = 255; /* Alpha: la imagen es opaca */
  }

  return rgba;
}

export default Ember.Component.extend({
	camaras: Ember.inject.service(),
  resources: Ember.inject.service(),
	tagName: 'canvas',
	attributeBindings: ['width', 'height'],
  width: Ember.computed.alias('camaras.formato.width'),
  height: Ember.computed.alias('camaras.formato.height'),
  imageData: Ember.computed('width', 'height', function() {
    var width = this.get('width');
    var height = this.get('height');

    var canvas = this.get('element');
    var ctx = canvas.getContext('2d');

    return ctx.createImageData(width, height);
  }),
  frameContext: {
    type: 'none',       /* 'cebolla' | 'preview' | 'none' */
    frames: [],         /* [ImageSources] from newer to older */
    cameraFrame: 0,     /* Integer */
    firstFrameAlpha: 1, /* Integer */
    lastFrameAlpha: 0   /* Integer */
    
  },

  prepareContext: Ember.observer('frameContext', function() {
    var width = this.get('width');
    var height = this.get('height');
    var frameContext = this.get('frameContext');
    var resources = this.get('resources');

    var frames = Promise.all(frameContext.frames.map(resources.loadImage));

    function dibujar_cebolla(imagenes) {
      return resources.renderOffscreen((ctx) => {
        imagenes.forEach((imagen, x) => {
          /* Interpolo linealmente:
           *   f(x) = ax + b
           *   f(0) = 1
           *   f(imagenes.length) = frameContext.lastFrameAlpha
           */
          var a = (frameContext.lastFrameAlpha - 1) / (imagenes.length);
          var b = frameContext.firstFrameAlpha;
          ctx.globalAlpha = a*x + b; /* x0 es el frame de la cámara*/
          ctx.drawImage(imagen, 0, 0);
        });
        return ctx.canvas;
      }, width, height, 'huayra_cebolla');
    }

    if(frameContext.type === 'cebolla') {
      frames.then(dibujar_cebolla);
    }
  }),

  processFrame(frame) {
    var canvas = this.get('element');
    var ctx = canvas.getContext('2d');
    var imageData = this.get('imageData');
    var frameContext = this.get('frameContext');
    var cebolla = this.get('resources.huayra_cebolla');

    rgb2rgba(frame, imageData.data); /* Modifico el buffer de data */

    ctx.putImageData(imageData, 0, 0);

    if(frameContext.type === 'cebolla' && cebolla !== undefined) {
      ctx.drawImage(cebolla, 0, 0);
    }
  },

  didInsertElement() {
    this.get('camaras').on('frame', this, this.processFrame);
  },

  willDestroyElement() {
    this.get('camaras').off('frame', this, this.processFrame);
  }
});
