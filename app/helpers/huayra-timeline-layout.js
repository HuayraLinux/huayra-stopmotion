import Ember from 'ember';

export default Ember.Helper.helper(function(params/*, hash*/) {
  return {
    /**
     * Return an object that describes the size of the content area
     */
    contentSize(clientWidth, clientHeight) {
      return {
        width: params[0] * params[1].length,
        height: clientHeight
      };
    },

    /**
     * Return the index of the first item shown.
     */
    indexAt(offsetX, offsetY, clientWidth, clientHeight) {
      return Math.floor(offsetX / params[0]);
    },

    /**
     *  Return the number of items to display
     */
    count(offsetX, offsetY, width, height) {
      return Math.ceil(width / params[0]);
    },

    /**
     * Return the css that should be used to set the size and position of the item.
     */
    formatItemStyle(itemIndex, clientWidth, clientHeight) {
      return `display: inline-block; position: absolute; left: ${itemIndex * params[0]}px`;
    }
  }
});
