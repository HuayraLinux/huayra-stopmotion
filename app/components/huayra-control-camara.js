import Ember from 'ember';
import Changeset from 'ember-changeset';

export default Ember.Component.extend({
	camaras: Ember.inject.service(),

	controls: Ember.computed.alias('camaras.controls'),

	save(that) {
		return that.save();
	}
});
