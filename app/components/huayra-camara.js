import Ember from 'ember';

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

  didInsertElement() {
    var canvas = this.get('element');
    var ctx = canvas.getContext('2d');

    this.get('camaras').on('frame', (frame) => {
      var imageData = this.get('imageData');

      rgb2rgba(frame, imageData.data); /* Modifico el buffer de data */

      ctx.putImageData(imageData, 0, 0);
    });
  }
});
