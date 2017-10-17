import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['huayra-timeline'],
  seleccion: [0, 0],
  moverConMovimiento: false,
  moverPosicionOriginalX: null,
  capturas: [],
  cursor: 0,

  elementos: Ember.computed('capturas.@each', 'cursor', 'seleccion.0', 'seleccion.1', function() {
    const seleccion = this.get('seleccion').slice(); /* Clono la seleccion */
    const capturas = this.get('capturas').map((captura, index) => ({ tipo: 'foto', captura, index }));
    const cursor = { tipo: 'cursor', index: this.get('cursor') };

    capturas.splice(cursor.index, 0, cursor);

    /* Como insterté el cursor si está adentro de la selección tengo que agrandarla */
    if(cursor.index >= seleccion[0] && cursor.index < seleccion[1]) {
      seleccion[1]++;
    }

    /* Splice es un método horrible así que explico los argumentos para ahorrar una googleada:
     *   desde el índice donde inicia la seleccion
     *   borro el tamaño de la selección (osea, las capturas de la seleccion)
     *   e inserto el elemento de tipo 'seleccion'
     */
    capturas.splice(seleccion[0], seleccion[1]- seleccion[0], {
      tipo: 'seleccion',
      elementos: capturas.slice(...seleccion)
    });

    return capturas;
  }),

  actions: {
    seleccionarCuadro(indiceDeCuadro, shift) {
      if (shift) {
        this.expandir_seleccion_a(indiceDeCuadro);
      } else {
        this.set('seleccion', [indiceDeCuadro, indiceDeCuadro + 1]);
      }
    },

    reordenar(from, to, tipo) {
      const [principio, fin] = this.get('seleccion');

      if(tipo === 'cursor') {
        this.sendAction('moverCursor', to)
      } else {
        if(tipo === 'seleccion') {
          this.sendAction('reordenarTimeline', from, to, fin - principio);
          /*** TODO: LIMPIAR ESTO ****/
          this.set('seleccion.0', principio + (to - from));
          this.set('seleccion.1', fin + (to - from));
          /*** NO ESTÁ BUENO SIDEFECTEAR LA SELECCION ***/
        } else if(tipo === 'foto') {
          if(principio < from) {
            from = from - 1 + fin - principio;
          }
          if(principio < to) {
            to = to - 1 + fin - principio;
          }
          this.sendAction('reordenarTimeline', from, to);
          if(to <= principio) {
            this.set('seleccion.0', principio + 1);
            this.set('seleccion.1', fin + 1);
          }
        }
      }
    }
  },

  expandir_seleccion_a(indiceDeCuadro) {
    let intervalo = this.get('seleccion');

    if (intervalo[1] > indiceDeCuadro) {
      this.set('seleccion.0', indiceDeCuadro);
    } else {
      this.set('seleccion.1', indiceDeCuadro + 1);
    }
  },
});
