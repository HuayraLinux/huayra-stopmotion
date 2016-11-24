import Ember from 'ember';

export default Ember.Service.extend(Ember.Evented, {

  disableClose() {
    window.onbeforeunload = (e) => {
      console.log(e);
      this.trigger('onClose');
      return true;
    };
  },

  enableClose() {
    window.onbeforeunload = () => {
      return undefined;
    };
  },

  forceQuit() {
    this.enableClose();
    window.close();
  },

  seleccionarUnDirectorio() {
    return new Ember.RSVP.Promise((success) => {
      let electron = requireNode('electron');
      let opciones = {properties: ['openDirectory']};

      electron.remote.dialog.showOpenDialog(opciones, (a) => {
        success(a);  
      });
    });
  }


});
