import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-cuadro'],
  classNameBindings: ['seleccionado'],
  tagName: ['li'],
  attributeBindings: ['draggable'],
  draggable: true,

  seleccionado: Ember.computed('intervaloSeleccion.0', 'intervaloSeleccion.1', function() {
    const [inicio, fin] = this.get('intervaloSeleccion');
    const cuadro = this.get('index');

    return inicio <= cuadro && cuadro < fin;
  }),

  numeroDeCuadro: Ember.computed('index', function() {
    return this.get('index') + 1;
  }),

  imagen: Ember.computed('cuadro.data_miniatura', 'cuadro.href_miniatura', function() {
    return this.get('cuadro.data_miniatura') || this.get('cuadro.href_miniatura');
  }),

  click(event) {
    this.sendAction('accionAlHacerClick', this.get('index'), event.shiftKey || event.metaKey);
  }
});
