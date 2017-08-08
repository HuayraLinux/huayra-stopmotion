import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-timeline'],
  intervaloSeleccion: [0, 0],
  moverConMovimiento: false,
  moverPosicionOriginalX: null,
  capturas: [],
  cursor: 0,

  actions: {
    alSeleccionarCuadro(indiceDeCuadro, shift) {
      if (shift) {
        this._expandir_seleccion_a(indiceDeCuadro);
      } else {
        this.set('intervaloSeleccion', [indiceDeCuadro, indiceDeCuadro + 1]);
      }
    },

    modificarTimeline(desde, hasta, tipo) {
      if(tipo === 'huayra-cuadro') {
        this.sendAction('moverCuadro', desde, hasta);
      } else if(tipo === 'huayra-cursor') {
        this.sendAction('moverCursor', hasta);
      }
    }
  },

  _expandir_seleccion_a(indiceDeCuadro) {
    let intervalo = this.get('intervaloSeleccion');

    if (intervalo[1] > indiceDeCuadro) {
      this.set('intervaloSeleccion.0', indiceDeCuadro);
    } else {
      this.set('intervaloSeleccion.1', indiceDeCuadro + 1);
    }
  },

  _mouseDown(event) {
    this.set('moverConMovimiento', true);
    this.set('moverPosicionOriginalX', event.clientX);
  },

  _mouseMove(event) {
    if (this.get('moverConMovimiento')) {
      let dx = event.clientX - this.get('moverPosicionOriginalX');

      this.$('').parent()[0].scrollLeft -= dx;

      this.set('moverPosicionOriginalX', event.clientX);
    }
  },

  _mouseUp() {
    this.set('moverConMovimiento', false);
  }
});
