import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('modal-confirmar-salir', 'Integration | Component | modal confirmar salir', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{modal-confirmar-salir}}`);
  assert.equal(this.$('h1').text().trim(), '¿Estás seguro de salir?');
});
