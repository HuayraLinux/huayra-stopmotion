import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return {
      nombre: 'Proyecto 1',
      ubicacion: '/path/demo',
      noPuedeCambiarRuta: true,
    };
  },

});
