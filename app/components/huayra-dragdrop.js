import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['dropzone'],
  classNameBindings: ['draggedOver:dragged-over'],
  draggedOver: false,

  attributeBindings: ['draggable'],
  draggable: true,

  dragType: Ember.computed('type', function() {
    return `x-ember/${this.get('type')}`;
  }),

  dragStart(event) {
    event.dataTransfer.setData('x-ember/from', this.get('data'));
    event.dataTransfer.setData('x-ember/type', this.get('type'));
  },

  dragEnter(event) {
    /* Acá habría que chequear que lo que se está arrastrando sea una miniatura, selección o cursor */
    if(event.dataTransfer.types.includes('x-ember/type')) {
      this.set('draggedOver', true);
      event.preventDefault(); /* Marco que soy una dropzone válida*/
    }
  },

  dragOver(event) {
    if(event.dataTransfer.types.includes('x-ember/type')) {
      this.set('draggedOver', true);
      event.preventDefault(); /* Marco que soy una dropzone válida*/
    }
  },

  dragLeave() {
    this.set('draggedOver', false);
  },

  drop(event) {
    const fromData = event.dataTransfer.getData('x-ember/from');
    const tipo = event.dataTransfer.getData('x-ember/type');
    event.preventDefault(); /* Evito cualquier cosa mágica que quiera hacer el browser */
    this.set('draggedOver', false);
    this.sendAction('onDrop', fromData, this.get('data'), tipo);
  }
});
