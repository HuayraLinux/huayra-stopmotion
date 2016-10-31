import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('huayra-cuadro', 'Integration | Component | huayra cuadro', {
  integration: true
});

test('it renders', function(assert) {
  this.set('cuadro', {});
  this.set('intervaloSeleccion', [0, 0]);

  this.set('index', 0);
  this.render(hbs`{{huayra-cuadro cuadro=cuadro index=index intervaloSeleccion=intervaloSeleccion}}`);
  assert.equal(this.$().text().trim(), '1', 'Muestra el número de cuadro 1');

  this.set('index', 5);
  this.render(hbs`{{huayra-cuadro cuadro=cuadro index=index intervaloSeleccion=intervaloSeleccion}}`);
  assert.equal(this.$().text().trim(), '6', 'Muestra el número de cuadro 6');
});
