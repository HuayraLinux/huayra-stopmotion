import Ember from 'ember';
const Promise = Ember.RSVP.Promise;
//import { Promise } from 'rsvp';

export default Ember.Service.extend({
  _resourceMap: {},

  /* loadImage: (URL, Maybe<String>) => Promise<Image> */
  loadImage(src, name) {
    return new Promise((accept, reject) => {
      var image = new Image();
      image.src = src;
      image.onerror = () => reject(image);
      image.onload = () => {
        accept(image);

        if(typeof(name) === 'string') {
          this.registerResorce(name, image);
        }
      };
    });
  },

  /* renderOffscreen: ((Context2D) => ImageData, Integer, Integer, Maybe<String>) => Promise<ImageData> */
  renderOffscreen(render, width, height, name) {
    return new Promise((accept) => {
      var imageData = this.renderOffscreenSync(render, width, height, name);
      accept(imageData);
    });
  },

  /* renderOffscreenSync: ((Context2D) => ImageData, Integer, Integer, Maybe<String>) => ImageData */
  renderOffscreenSync(render, width, height, name) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var result;

    canvas.width = width;
    canvas.height = height;

    result = render(ctx);

    if(typeof(name) === 'string') {
      this.registerResource(name, result);
    }

    return result;
  },

  registerResource(name, resource) {
    var resources = this.get('_resourceMap');
    Ember.set(resources, name, resource);
  },

  unknownProperty(key) {
    var resources = this.get('_resourceMap');
    return Ember.get(resources, key);
  }
});
