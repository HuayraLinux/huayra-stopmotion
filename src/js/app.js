window.VERSION = "0.2";

var app = angular.module('app', ['ngAnimate', 'ui.bootstrap']);
var fs = require('fs');

require('nw.gui').Window.get().setPosition('center');

/* Hack para setear WM_CLASS */
require('nwjs-hack').set_wmclass("huayra-motion", true);
fs.writeFileSync('/tmp/huayra-stopmotion.pid', process.pid);
