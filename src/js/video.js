var onFailSoHard = function(e) {
  var video = document.querySelector('video');
  video.src = 'media/error_camara.webm';
  video.play();
  console.log("Error al capturar la camara.");
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