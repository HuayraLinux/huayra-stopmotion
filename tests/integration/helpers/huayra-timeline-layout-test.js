
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('huayra-timeline-layout', 'helper:huayra-timeline-layout', {
  integration: true
});

// Replace this with your real tests.
test('it renders', function(assert) {
  this.set('inputValue', '1234');

  this.render(hbs`{{huayra-timeline-layout inputValue}}`);

  assert.equal(this.$().text().trim(), '1234');
});

