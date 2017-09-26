import Ember from 'ember';

export default Ember.Component.extend({
  itemSelector: '.item',
  didInsertElement() {
    const itemSelector = this.get('itemSelector');
    this.$(itemSelector).tab({
      context: this.$()
    });
  }
});
