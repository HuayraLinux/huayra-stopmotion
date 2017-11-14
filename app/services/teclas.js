import Ember from 'ember';

/* Si se llega a necesitar usa algo de este estilo:
 * http://www.openjs.com/scripts/events/keyboard_shortcuts/shortcut.js
 */

const teclas = {
  37: 'izquierda',
  39: 'derecha',
  13: 'enter',
  32: 'espacio'
};

export default Ember.Service.extend(Ember.Evented, {
  init() {
    Ember.$(document).keydown((event) => {
      if (event.keyCode in teclas) {
        this.trigger(teclas[event.keyCode], event);
      }
    });
  }
});
