import Ember from 'ember';
const Promise = Ember.RSVP.Promise;
//import { Promise } from 'rsvp';

export default Ember.Service.extend({
    /* loadImage = (URL) => Promise<Image> */
    loadImage(src) {
        return new Promise((accept, reject) => {
            var image = new Image();
            image.src = src;
            image.onload = accept;
            image.onerror = reject;
        });
    },
    /* renderOffscreen: ((Context2D) => ImageData, Integer, Integer) => Promise<ImageData> */
    renderOffscreen(render, width, height) {
        return new Promise((accept) =>{
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var result;

            canvas.width = width;
            canvas.height = height;

            result = render(ctx);

            accept(result);
        });
    }
});
