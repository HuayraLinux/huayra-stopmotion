import Ember from 'ember';

export default Ember.Controller.extend({
  cebolla: {
    frames: [],       /* [<imgsource>] */
    cebollaLength: 3, /* Integer */
    alphaIn: 0.2,     /* Integer */
    alphaOut: 0.2,    /* Integer */
    cameraFrame: 0    /* NO IMPLEMENTADO | Integer */
  },

  guardar(changes) {
    changes.save();
  }
});
