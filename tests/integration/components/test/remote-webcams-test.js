import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('test/remote-webcams', 'Integration | Component | test/remote webcams', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{test/remote-webcams}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#test/remote-webcams}}
      template block text
    {{/test/remote-webcams}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
