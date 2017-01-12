import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['huayra-cursor'],
  attributeBindings: ['draggable'],
  draggable: true,
  index: 0,

  dragStart(event) {
    event.dataTransfer.setData('x-ember/from', this.get('index'));
    event.dataTransfer.setData('x-ember/type', 'huayra-cursor');
  }
});
