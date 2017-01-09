import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-timeline'],
  tagName: 'ol',
  intervaloSeleccion: [0, 0],
  moverConMovimiento: false,
  moverPosicionOriginalX: null,
  capturas: [],

  seleccion: Ember.computed('intervaloSeleccion.0', 'intervaloSeleccion.1', 'capturas.[]', function() {
    const [inicio, fin] = this.get('intervaloSeleccion');
    return this.get('capturas').slice(inicio, fin);
  }),
  capturasPrevias: Ember.computed('intervaloSeleccion.0', 'capturas.[]', function() {
    const [inicio] = this.get('intervaloSeleccion');
    return this.get('capturas').slice(0, inicio);
  }),
  capturasPosteriores: Ember.computed('intervaloSeleccion.1', 'capturas.[]', function() {
    const [,fin] = this.get('intervaloSeleccion');
    return this.get('capturas').slice(fin);
  }),

  actions: {
    alSeleccionarCuadro(indiceDeCuadro, shift) {
      if (shift) {
        this._expandir_seleccion_a(indiceDeCuadro);
      } else {
        this.set('intervaloSeleccion', [indiceDeCuadro, indiceDeCuadro + 1]);
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
