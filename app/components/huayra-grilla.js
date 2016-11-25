import Ember from 'ember';

export default Ember.Component.extend({
  camaras: Ember.inject.service(),
  tagName: 'canvas',
  classNames: ['canvas-layer'],
  attributeBindings: ['width', 'height'],
  width: Ember.computed.alias('camaras.formato.width'),
  height: Ember.computed.alias('camaras.formato.height'),

  config: {
    filas: 3,       /* Integer */
    columnas: 3,    /* NO IMPLEMENTEADO (Integer) */
    lineWidth: 2,   /* Integer */
    style: 'black', /* Integer */
    dashFormat: [], /* https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash */
  },

  grilla: Ember.observer('config.filas', 'config.columnas', 'config.style', 'config.lineWidth', 'config.dashFormat', function() {
    var width = this.get('width');
    var height = this.get('height');
    var filas = this.get('config.filas');
    var columnas = this.get('config.columnas');
    var style = this.get('config.style');
    var lineWidth = this.get('config.lineWidth');
    var dashFormat = this.get('config.dashFormat');

    var canvas = this.get('element');
    var ctx = canvas.getContext('2d');


    ctx.clearRect(0, 0, width, height);
    ctx.setLineDash(dashFormat);
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = style;

    ctx.beginPath();

    for(var x = width / columnas; x < width; x += width / columnas) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for(var y = height / filas; y < height; y += height / filas) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  }),

  didInsertElement() {
    this.grilla(); /* Init! */
  }
});
