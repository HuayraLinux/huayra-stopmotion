import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['dropzone'],
  classNameBindings: ['dragOverDropzone'],
  dragOverDropzone: '',

  dragEnter() {
    /* Acá habría que chequear que lo que se está arrastrando sea una miniatura, selección o cursor */
    this.set('dragOverDropzone', 'dragOverDropzone');
  },
  dragLeave() {
    this.set('dragOverDropzone', '');
  },
  drop() {

  }
});
