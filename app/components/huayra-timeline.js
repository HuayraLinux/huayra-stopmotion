import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-timeline'],
  tagName: 'ul',
  intervaloSeleccion: [0, 0],
  moverConMovimiento: false,
  moverPosicionOriginalX: null,

  actions: {
    alSeleccionarCuadro(indiceDeCuadro, shift) {
      let numeroDeCuadro = indiceDeCuadro + 1;

      if (shift) {
        this._expandir_seleccion_a(numeroDeCuadro);
      } else {
        this.set('intervaloSeleccion', [numeroDeCuadro, numeroDeCuadro]);
      }

    }
  },

  _expandir_seleccion_a(numeroDeCuadro) {
    let intervalo = this.get('intervaloSeleccion');

    if (intervalo.length === 2) {
      if (intervalo[1] > numeroDeCuadro) {
        intervalo[0] = numeroDeCuadro;
      } else {
        if (intervalo[0] < numeroDeCuadro) {
          intervalo[1] = numeroDeCuadro;
        }
      }
    }

    this.set('intervaloSeleccion', [intervalo[0], intervalo[1]]);
  },

  mouseDown(event) {
    this.set('moverConMovimiento', true);
    this.set('moverPosicionOriginalX', event.clientX);
  },

  mouseMove(event) {
    if (this.get('moverConMovimiento')) {
      let dx = event.clientX - this.get('moverPosicionOriginalX');

      this.$('').parent()[0].scrollLeft -= dx;

      this.set('moverPosicionOriginalX', event.clientX);
    }
  },

  mouseUp() {
    this.set('moverConMovimiento', false);
  },


});
