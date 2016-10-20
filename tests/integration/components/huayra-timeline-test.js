import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('huayra-timeline', 'Integration | Component | huayra timeline', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{huayra-timeline}}`);
  assert.equal(this.$().text().trim(), 'Espacio reservado para el timeline.');
});
