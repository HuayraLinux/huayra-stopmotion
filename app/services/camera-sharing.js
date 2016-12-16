import Ember from 'ember';

const bonjour = requireNode('bonjour');
const http = requireNode('http');

export default Ember.Service.extend({
  camaras: Ember.inject.service(),

  bonjour: null,
  webcamService: null,
  httpServer: null,
  search: null,
  remoteWebcams: Ember.computed.alias('search.services'),

  onInit: Ember.on('init', function() {
    const bonjourInstance = bonjour();
    const search = bonjourInstance.find({ type: 'huayra-stopmotion' });

    search.on('up', () => {
      this.notifyPropertyChange('search');
      this.notifyPropertyChange('remoteWebcams');      
    });

    search.on('down', () => {
      this.notifyPropertyChange('search');
      this.notifyPropertyChange('remoteWebcams');
    });

    window.GLOBAL_search = search;

    this.set('bonjourInstance', bonjourInstance);
    this.set('search', search);

    this.start();
  }),

  start() {
    const httpServer = http.createServer((req, res) => {
      const video = this.get('camaras.seleccionada').video;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0);

      const image = canvas.toDataURL('image/png');
      const base64Image = image.replace(/^data:[^,]+,/, "");

      res.writeHead(200, { 'Content-Type': 'image/png' });

      res.end(base64Image, 'base64');
    }).listen();
    const serverAddress = httpServer.address();
    const webcamService = this.get('bonjourInstance')
      .publish({ name: 'Huayra-Stopmotion test', type: 'huayra-stopmotion', port: serverAddress.port });

    console.info(`Se inició el servidor de fotos en ${serverAddress.port}`);

    this.set('httpServer', httpServer);
    this.set('webcamService', webcamService);
  },

  stop() {
    this.get('httpServer').close();
    this.get('webcamService').stop();
  }
});
