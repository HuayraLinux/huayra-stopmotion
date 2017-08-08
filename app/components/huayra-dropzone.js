import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['dropzone'],
  classNameBindings: ['dragOverDropzone'],
  dragOverDropzone: '',

  dragEnter(event) {
    /* Acá habría que chequear que lo que se está arrastrando sea una miniatura, selección o cursor */
    if(event.dataTransfer.types.contains('x-ember/from')) {
      this.set('dragOverDropzone', 'dragOverDropzone');
      event.preventDefault(); /* Marco que soy una dropzone válida*/
    }
  },

  dragOver(event) {
    if(event.dataTransfer.types.contains('x-ember/from')) {
      this.set('dragOverDropzone', 'dragOverDropzone');
      event.preventDefault(); /* Marco que soy una dropzone válida*/
    }
  },

  dragLeave() {
    this.set('dragOverDropzone', '');
  },

  drop(event) {
    const cuadroIndex = event.dataTransfer.getData('x-ember/from');
    const tipo = event.dataTransfer.getData('x-ember/type');
    event.preventDefault(); /* Evito cualquier cosa mágica que quiera hacer el browser */
    this.set('dragOverDropzone', '');
    this.sendAction('onDrop', cuadroIndex, this.get('index'), tipo);
  }
});
