import Ember from 'ember';

const Promise = Ember.RSVP.Promise;
const createServer = requireNode('webcam-http-streaming').createHTTPStreamingServer;

export default Ember.Service.extend({
  server: null,
  camaras: Ember.inject.service(),
  webcams: Ember.computed.alias('camaras.camaras'),

  port: Ember.computed('server', function() {
    return this.get('server').address().port;
  }),

  createServer: Ember.on('init', function() {
    /* x264 over matroska */
    const encoder = {
      command: 'avconv',
      flags: (webcam) => `-f video4linux2 -i ${webcam} -f matroska -vcodec libx264 -acodec none -preset ultrafast pipe:1`,
      mimeType: 'video/x-matroska'
    };

    const options = {
      isValidWebcam: (webcam) => new Promise
        ((accept, refuse) =>
          this.get('webcams').find((localWebcam) => webcam === localWebcam.DEVNAME)?
            accept(webcam) : refuse(false)),
      additionalEndpoints: {
        '/list': (req, res) => {
          const webcamList = this.get('webcams')
            .map((webcam) => ({
              url: `/webcam?webcam=${webcam.DEVNAME}`,
              name: webcam.ID_V4L_PRODUCT
            }));

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(webcamList));
        }
      },
      encoder: encoder
    };

    const server = createServer(options).listen();

    server.on('listening', () => {
      this.notifyPropertyChange('port');
      console.log('Server listening:', server.address());
    });

    this.set('server', server);
  })
});
