import Ember from 'ember';

export default Ember.Component.extend({
  image: null,

  loadImage: Ember.on('init', function() {
    const image = new Image();
    const host = this.get('host');
    const port = this.get('port');
    const now = Date.now();
    image.onload = () => {
      this.set('image', image);
      this.loadImage();
    };
    image.onerror = () => {
      this.loadImage();
    };
    image.src = `http://${host}:${port}/${now}`;
  }),
});
