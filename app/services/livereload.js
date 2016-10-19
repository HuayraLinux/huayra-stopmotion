import Ember from 'ember';
import config from '../config/environment';


export default Ember.Service.extend({

  inicializar: Ember.on('init', function() {

    if (config.electronLiveReload && window.inElectron) {
      console.warn("Se ha inicializado el modo livereload desde config/environment");

      let fs = requireNode('fs');

      fs.watchFile('dist/index.html', this.reload);
      fs.watchFile('dist/assets/huayra-stopmotion.js', this.reload);
      fs.watchFile('dist/assets/huayra-stopmotion.css', this.reload);
      fs.watchFile('dist/assets/vendor.js', this.reload);
    }

  }),

  reload() {
    console.log("Reiniciando ...");
    window.location.reload();
  }

});
