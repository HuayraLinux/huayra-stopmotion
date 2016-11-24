import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    let modeloInicial = {
      nombre: 'Proyecto 1',
      ubicacion: '/path/demo',
      noPuedeCambiarRuta: true,
    };

    if (inElectron) {
      modeloInicial.noPuedeCambiarRuta = false;
      modeloInicial.ubicacion = undefined;
    }

    return modeloInicial;
  },

});
