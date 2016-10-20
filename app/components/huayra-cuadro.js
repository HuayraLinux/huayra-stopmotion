import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-cuadro'],

  didInsertElement() {
    let cuadro = this.get('cuadro');
    let href = null;

    // Si está en chrome, firefox o los tests se encontrará con esta
    // información.
    if (cuadro.data_miniatura) {
      href = cuadro.data_miniatura;
    } else {
      href = cuadro.href_miniatura;
    }

    this.$('img').attr('src', href);

  }
});
