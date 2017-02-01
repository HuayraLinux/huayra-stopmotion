import Ember from 'ember';

const service = Ember.Service.extend({});

export default service;

if(inElectron) {
  const requireElectron = requireNode('electron').remote.require;
  const createServer = requireNode('webcam-http-streaming').createHTTPStreamingServer;
  const hostname = requireNode('os').hostname;
  const Promise = Ember.RSVP.Promise;
  const bonjour = requireElectron('bonjour');

  service.reopen({
    server: null,
    bonjour: null,
    service: null,
    search: null,
    camaras: Ember.inject.service(),
    webcams: Ember.computed.alias('camaras.camaras'),

    port: Ember.computed('server', function() {
      return this.get('server').address().port;
    }),

    remoteInstances: Ember.computed('search', function() {
      return this.get('search').services;
    }),

    stop() {
      if(this.bonjour && this.search && this.server){
        this.bonjour.unpublishAll();
        this.search.removeAllListeners();
        this.search.stop();
        this.server.close();
        this.bonjour.destroy();
      }
    },

    closeOnUnload: Ember.on('init', function() {
      /* Clean on unload */
      $(window).on('beforeunload', () => {
        this.stop();
      });
    }),

    start() {
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


      const bonjourInstance = bonjour();

      this.set('bonjour', bonjourInstance);

      const bonjourService = bonjourInstance.publish({
        name: `${hostname()} ${Date.now()}`,
        type: 'huayra-stopmotion',
        port: this.get('port')
      });

      this.set('service', bonjourService);

      const bonjourSearch = bonjourInstance.find({ type: 'huayra-stopmotion' });

      bonjourSearch.on('up', () => this.notifyPropertyChange('remoteInstances'));
      bonjourSearch.on('down', () => this.notifyPropertyChange('remoteInstances'));

      this.set('search', bonjourSearch);
    }
  });
}
