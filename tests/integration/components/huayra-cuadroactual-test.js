import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('huayra-cuadroactual', 'Integration | Component | huayra cuadroactual', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{huayra-cuadroactual}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#huayra-cuadroactual}}
      template block text
    {{/huayra-cuadroactual}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
