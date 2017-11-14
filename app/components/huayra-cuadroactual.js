import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'img',
  classNames: ['canvas-layer'],
  attributeBindings: ['width', 'height', 'src', 'style'],
  config: {
    frames: [],
    cameraFrame: 0,
    alpha: 1,
  },

  src: Ember.computed('config.frames', 'config.cameraFrame', function() {
    const frames = this.get('config.frames');
    const cursor = Math.max(Math.min(this.get('config.cameraFrame'), frames.length - 1), 0);
    const selectedFrame = Ember.get(frames, cursor.toString());

    return selectedFrame.href;
  }),

  style: Ember.computed('config.alpha', function() {
    return Ember.String.htmlSafe(`opacity: ${Number(this.get('config.alpha'))};`);
  })
});
