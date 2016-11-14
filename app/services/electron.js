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
  }


});
