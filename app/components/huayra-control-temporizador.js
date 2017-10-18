import Ember from 'ember';


export default Ember.Component.extend({
	tagName: 'fieldset',
	classNames: ['huayra-control'],
	value: Ember.computed('timerInterval', function() {
		/* twoDigits number string*/
		function td(num) {
			return (num < 10 ? '0' : '') + num.toString();
		}

		const interval = this.get('interval');
		const segundos = Math.floor(interval / 1000);
		const minutos = Math.floor(segundos / 60);
		const horas = Math.floor(minutos / 60);
		return `${td(horas % 24)}:${td(minutos % 60)}:${td(segundos % 60)}`;
	})
});
