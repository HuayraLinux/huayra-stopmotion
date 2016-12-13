import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-cuadro'],
  classNameBindings: ['seleccionado'],
  tagName: ['li'],
  intervaloSeleccion: null,

  numeroDeCuadro: Ember.computed('index', function() {
    return this.get('index') + 1;
  }),

  seleccionado: Ember.computed('intervaloSeleccion.0', 'intervaloSeleccion.1', function() {
    let intervalo = this.get('intervaloSeleccion');
    let cuadro = this.get('index');

    return intervalo[0] <= cuadro && cuadro < intervalo[1];
  }),

  didInsertElement() {
    let cuadro = this.get('cuadro');
    let href = null;

    // Si está en chrome, firefox o los tests se encontrará con esta
    // información.
    if (cuadro.data_miniatura) {
      href = cuadro.data_miniatura;
    } else {
      href = cuadro.href_miniatura;
    }

    this.$('img').attr('src', href);

  },

  click(event) {
    this.sendAction('accionAlHacerClick', this.get('index'), event.shiftKey || event.metaKey);
  },

  dragStart(/*event*/) {
    return false;
  },

  mouseDown(event) {
    event.preventDefault();
  },

  mouseMove(event) {
    event.preventDefault();
  },

  mouseUp(event) {
    event.preventDefault();
  },

});
