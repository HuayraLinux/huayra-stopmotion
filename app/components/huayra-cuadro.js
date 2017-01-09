import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-cuadro'],
  tagName: ['li'],
  attributeBindings: ['draggable'],
  draggable: true,

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
