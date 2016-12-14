import Ember from 'ember';

export default Ember.Component.extend({
	camaras: Ember.inject.service(),
	tagName: 'video',
  classNames: ['canvas-layer'],
	attributeBindings: ['srcObject'],
  srcObject: Ember.computed.alias('camaras.seleccionada.srcObject'),
});
