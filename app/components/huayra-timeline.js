import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-timeline'],
  tagName: 'ul',
  intervaloSeleccion: [0, 0],

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
  }
});
