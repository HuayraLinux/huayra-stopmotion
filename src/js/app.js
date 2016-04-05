window.VERSION = "0.2";

var app = angular.module('app', ['ngAnimate', 'ui.bootstrap']);
var fs = require('fs');
fs.writeFileSynch('/tmp/huayra-stopmotion.pid', process.pid);
