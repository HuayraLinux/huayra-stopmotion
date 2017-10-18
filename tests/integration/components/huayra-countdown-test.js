import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('huayra-countdown', 'Integration | Component | huayra countdown', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  // Template block usage:
  this.render(hbs`
    {{#huayra-countdown interval=3723000 as |hours minutes seconds|}}
      <span class="hours">{{hours}}</span>
      <span class="minutes">{{minutes}}</span>
      <span class="seconds">{{seconds}}</span>
    {{/huayra-countdown}}
  `);

  assert.equal(this.$('.hours').text().trim(), '1');
  assert.equal(this.$('.minutes').text().trim(), '2');
  assert.equal(this.$('.seconds').text().trim(), '3');
});
