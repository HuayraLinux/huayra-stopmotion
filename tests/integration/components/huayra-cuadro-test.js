import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('huayra-cuadro', 'Integration | Component | huayra cuadro', {
  integration: true
});

test('it renders', function(assert) {
  this.set('cuadro', {});

  this.render(hbs`{{huayra-cuadro cuadro=cuadro}}`);
  assert.equal(this.$().text().trim(), '');
});
