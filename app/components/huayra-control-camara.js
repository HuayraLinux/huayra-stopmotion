import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'fieldset',
	classNames: ['huayra-control'],
	camaras: Ember.inject.service(),
	controls: Ember.computed.alias('camaras.controls'),

	check(control, checked) {
		control.set('value', checked ? 1 : 0);
	}
});
