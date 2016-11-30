import Ember from 'ember';
import Changeset from 'ember-changeset';

export default Ember.Component.extend({
	tagName: 'fieldset',
	classNames: ['huayra-control'],
	camaras: Ember.inject.service(),

	controls: Ember.computed('camaras.controls', function() {
		return this.get('camaras.controls').map((control) => new Changeset(control));
	}),

	save() {
		return this.get('controls').map((control) => control.save());
	},

	check(control, checked) {
		control.set('value', checked ? 1 : 0);
	}
});
