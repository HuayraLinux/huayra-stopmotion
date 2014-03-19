var app = angular.module('app');

app.service('Video', function() {
    var numero = 0;
    var prefijo = Math.random();
    var video = document.querySelector('video');
    var exec = require('child_process').exec;
    var capturador = undefined;
    
    /**
     * Capturador de video que se utiliza si el equipo
     * no soporta acceso a la webcam utilizando HTML5.
     */
    function CapturadorUVC() {
        var self = this;
        self.brillo = 5;
        self.contraste = 5;

        this.cuando_obtiene_captura = function(ruta) {
            var img = document.getElementById("imagen_uvc");

            if (img) {
                var d = new Date();
                img.src = ruta + "?" + d.getTime();
            }
        }

        this.definir_brillo = function(brillo) {
            self.brillo = Math.floor(brillo);
        }

        this.definir_contraste = function(contraste) {
            self.contraste = Math.floor(contraste);
        }

        this.iniciar = function() {
            exec('uvcdynctrl -s "Exposure, Auto" 1', function(error, stdout, stderr) {
                console.log("Resultado de uvcdynctrl", error, stdout, stderr);
            });

            function capturar() {
                exec('uvccapture -m -o/tmp/snap.jpg -x800 -y600 -q100 -B' + self.brillo + ' -C' + self.contraste, function(error, stdout, stderr) {
                    self.cuando_obtiene_captura('/tmp/snap.jpg');
                    setTimeout(capturar, 10);
                });
            }

            capturar();
        }

    }

    this.definir_brillo = function(brillo) {
        if (capturador)
            capturador.definir_brillo(brillo);
    }

    this.definir_contraste = function(contraste) {
        if (capturador)
            capturador.definir_contraste(contraste);
    }



    this.iniciar = function(callback_respuesta) {
        
        function cuando_falla(error) {
          console.log(error);
          //var video = document.querySelector('video');
          //video.src = 'media/error_camara.webm';
          //video.play();

          capturador = new CapturadorUVC(); 
          capturador.iniciar();
          callback_respuesta("uvc");
        }

        function cuando_obtiene_stream(stream) {
          video.src = window.URL.createObjectURL(stream);
          callback_respuesta("html5");
        }

        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        if (navigator.getUserMedia) {
          var medios = {audio: false, video: true};

          navigator.getUserMedia(medios, cuando_obtiene_stream, cuando_falla);
        }

    }
});
