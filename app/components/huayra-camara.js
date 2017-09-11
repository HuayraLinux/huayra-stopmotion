import Ember from 'ember';

export default Ember.Component.extend({
	camaras: Ember.inject.service(),
	tagName: 'div',
  classNames: ['canvas-layer'],
	classNameBindings: ['flipX', 'flipY'],

	flipX:false,
	flipY:false,

	didInsertElement() {
		this.$('video')[0].play();
	}
});
