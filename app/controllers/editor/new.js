import Ember from 'ember';

export default Ember.Controller.extend({
  nombre: "",
  mensajeNombreInvalido: "",
  ubicacion: "",

  activate() {
    this.set('nombre', '');
    this.set('ubicacion', '');
  }
});
