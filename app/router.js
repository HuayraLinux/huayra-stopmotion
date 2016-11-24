import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('camaras');
  this.route('debug', function() {
    this.route('index');
    this.route('timeline');
    this.route('modal');
    this.route('grilla');
  });

  this.route('editor', function() {
    this.route('new');
    this.route('editar', {path: 'editar/:ubicacion'});
  });

});

export default Router;
