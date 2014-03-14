var numero = 0;
var prefijo = Math.random();
var video = document.querySelector('video');
var exec = require('child_process').exec;

/**
 * Capturador de video que se utiliza si el equipo
 * no soporta acceso a la webcam utilizando HTML5.
 */
function CapturadorUVC() {
    var self = this;

    this.cuando_obtiene_captura = function(ruta) {
        var img = document.getElementsByTagName("img")[3];

        if (img) {
            img.src = ruta;
        }

    }

    this.iniciar = function() {
        console.log("iniciando");

        function capturar() {

            exec('uvccapture -m', function(error, stdout, stderr) {
                self.cuando_obtiene_captura('snap.jpg');
                console.log(error, stdout, stderr);
                setTimeout(capturar, 1000);
            });
        }

        capturar();
    }
    
}

function cuando_falla(error) {
  console.log(error);
  //var video = document.querySelector('video');
  //video.src = 'media/error_camara.webm';
  //video.play();
  
  var capturador = new CapturadorUVC(); 
  capturador.iniciar();
}

function cuando_obtiene_stream(stream) {
  video.src = window.URL.createObjectURL(stream);
}

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (navigator.getUserMedia) {
  var medios = {audio: false, video: true};

  navigator.getUserMedia(medios, cuando_obtiene_stream, cuando_falla);
}
