import Ember from 'ember';

export default Ember.Helper.helper(function([width, height, elementos]/*, hash*/) {
  const padding = 4;
  const seleccionIndex = elementos.findIndex(elemento => elemento.tipo === 'seleccion');
  const seleccion = elementos[seleccionIndex];
  const seleccionLength = seleccion.elementos.length;

  return {
    /**
     * Return an object that describes the size of the content area
     */
    contentSize() {
      return {
        width: (width + padding) * (elementos.length + seleccionLength - 1),
        height: height
      };
    },

    /**
     * Return the index of the first item shown.
     */
    indexAt(offsetX) {
      const possibleIndex = Math.floor(offsetX / (width + padding));
      const frameIndex = possibleIndex > seleccionIndex ?
                         Math.max(0, possibleIndex - seleccionLength) : possibleIndex;

      return frameIndex;
    },

    /**
     *  Return the number of items to display
     */
    count(offsetX, offsetY, clientWidth) {
      return Math.ceil(clientWidth / width);
    },

    /**
     * Return the css that should be used to set the size and position of the item.
     */
    formatItemStyle(itemIndex) {
      const elemento = elementos[itemIndex];
      let posicion = itemIndex * (width + padding);

      if (elemento === seleccion && seleccionLength === 0) {
        return 'display: none';
      } else if (seleccionIndex < itemIndex) {
        posicion += (seleccionLength - 1) * (width + padding);
      }

      return `position: absolute; left: ${posicion}px`;
    }
  }
});
