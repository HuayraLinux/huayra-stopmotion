import Ember from 'ember';
const Promise = Ember.RSVP.Promise;

export default Ember.Component.extend({
  camaras: Ember.inject.service(),
  resources: Ember.inject.service(),
  tagName: 'canvas',
  classNames: ['canvas-layer'],
  attributeBindings: ['width', 'height'],
  width: Ember.computed.alias('camaras.seleccionada.video.videoWidth'),
  height: Ember.computed.alias('camaras.seleccionada.video.videoHeight'),

  /* Del formulario vienen strings en lugar de números, reparar eso */
  config: {
    frames: [],      /* [ImageSources] from newer to older */
    futureFrames: 0, /* Integer */
    pastFrames: 3,   /* Integer */
    cameraFrame: 0,  /* Integer */
    alpha: 0.2,      /* Float */
  },

  framesCebolla: Ember.computed('config.futureFrames', 'config.pastFrames', 'config.frames.[]', 'config.cameraFrame', function() { /* Cambiar cuando exista el cursor de inserción */
    const cuadrosAdelante = Number(this.get('config.futureFrames')); /* Los slice son [a;b) */
    const cuadrosAtras = Number(this.get('config.pastFrames'));
    const camara = Number(this.get('config.cameraFrame'));
    const frames = this.get('config.frames');

    const inicio = camara - cuadrosAtras < 0 ?
      0 : camara - cuadrosAtras;
    const fin = camara + cuadrosAdelante > frames.length ?
      frames.length : camara + cuadrosAdelante;

    return this.get('config.frames')
      .slice(inicio, fin)
      .map((captura) => captura.href);
  }),

  /* Como framesCebolla es un computed no va a triggerear el evento automáticamente, así que voy a escuchar por él */
  cebolla: Ember.observer(
    'config.futureFrames', 'config.pastFrames', 'config.frames.[]',
    'config.cameraFrame', /*'framesCebolla',*/ 'config.alpha',
    'width', 'height',
    function() {
      var resources = this.get('resources');
      var width = this.get('width');
      var height = this.get('height');
      var frames = this.get('framesCebolla');
      var alpha = Number(this.get('config.alpha'));

      var canvas = this.get('element');
      var ctx = canvas.getContext('2d');

      var loadFrames = Promise.all(frames.map(resources.loadImage));

      function dibujar_cebolla(imagenes) {
        ctx.clearRect(0, 0, width, height);
        ctx.globalAlpha = alpha;
        imagenes.forEach((imagen) => ctx.drawImage(imagen, 0, 0));
      }

      loadFrames.then(dibujar_cebolla);
    }
  ),

  didInsertElement() {
    this.cebolla(); /* Init! */
  }
});
