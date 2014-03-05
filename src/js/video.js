var onFailSoHard = function(e) {
  var video = document.querySelector('video');
  video.src = 'media/error_camara.webm';
  video.play();
  console.log("Error al capturar la camara.");
  
  
  var Camelot = require('camelot.js');

  var camelot = new Camelot( {
    'rotate' : '180',
    'flip' : 'v'
  });

  camelot.on('frame', function (image) {
    console.log('frame received!');
  });

  camelot.on('error', function (err) {
    console.log(err);
  });

  camelot.grab( {
    'title' : 'Camelot',
    'font' : 'Arial:24',
    'frequency' : 1
  });
  
  
};

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

var video = document.querySelector('video');
  

if (navigator.getUserMedia) {
  navigator.getUserMedia({audio: false, video: true}, function(stream) {
    video.src = window.URL.createObjectURL(stream);
  }, onFailSoHard);
} else {
  console.log("No se puede obtener getusermedia.");
  video.src = 'media/error_camara.webm';
  video.play();
}