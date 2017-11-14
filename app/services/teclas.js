import Ember from 'ember';

const {globalShortcut} = requireNode('electron').remote;

export default Ember.Service.extend(Ember.Evented, {
  init() {
    globalShortcut.register('Return', () => this.trigger('capturar'));
  }
});
