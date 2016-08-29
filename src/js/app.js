window.VERSION = "0.2";

var app = angular.module('app', ['ngAnimate', 'ui.bootstrap']);
var fs = require('fs');

/* Hack para setear WM_CLASS */
require('nwjs-hack').set_wmclass(null, "huayra-motion", true);
fs.writeFileSync('/tmp/huayra-stopmotion.pid', process.pid);
