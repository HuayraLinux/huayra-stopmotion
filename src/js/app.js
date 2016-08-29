window.VERSION = "0.2";

/* Hack para setear WM_CLASS */
process.mainModule.exports.init(require('nwjs-hack').set_wmclass.bind(null, "huayra-motion", true));

var app = angular.module('app', ['ngAnimate', 'ui.bootstrap']);
var fs = require('fs');
fs.writeFileSync('/tmp/huayra-stopmotion.pid', process.pid);
