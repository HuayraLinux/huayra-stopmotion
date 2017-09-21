import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-cuadro'],
  classNameBindings: ['seleccionado', 'seleccionado-inicio', 'seleccionado-fin'],
  attributeBindings: ['draggable'],
  draggable: true,

  seleccionado: Ember.computed('intervaloSeleccion.0', 'intervaloSeleccion.1', 'index', function() {
    const [inicio, fin] = this.get('intervaloSeleccion');
    const cuadro = this.get('index');

    return inicio <= cuadro && cuadro < fin;
  }),
  'seleccionado-inicio': Ember.computed('intervaloSeleccion.0', 'intervaloSeleccion.1', 'index', function() {
    const [inicio, fin] = this.get('intervaloSeleccion');
    const cuadro = this.get('index');

    return cuadro === inicio;
  }),
  'seleccionado-fin': Ember.computed('intervaloSeleccion.0', 'intervaloSeleccion.1', 'index', function() {
    const [inicio, fin] = this.get('intervaloSeleccion');
    const cuadro = this.get('index');

    return cuadro === (fin - 1);
  }),

  numeroDeCuadro: Ember.computed('index', function() {
    return this.get('index') + 1;
  }),

  imagen: Ember.computed('cuadro.data_miniatura', 'cuadro.href_miniatura', function() {
    return this.get('cuadro.data_miniatura') || this.get('cuadro.href_miniatura');
  }),

  click(event) {
    this.sendAction('accionAlHacerClick', this.get('index'), event.shiftKey || event.metaKey);
  },

  dragStart(event) {
    event.dataTransfer.setData('x-ember/from', this.get('index'));
    event.dataTransfer.setData('x-ember/type', 'huayra-cuadro');
  }
});
