var app = angular.module('app');

app.service('Video', function() {
    var numero = 0;
    var prefijo = Math.random();
    var video = document.querySelector('video');
    var exec = require('child_process').exec;
    var capturador = undefined;
    var camara_id = 0;    
    /**
     * Capturador de video que se utiliza si el equipo
     * no soporta acceso a la webcam utilizando HTML5.
     */
    function CapturadorUVC() {
        var self = this;
        self.brillo = 5;
        self.contraste = 5;

        this.abortar = function(msg){
            jQuery('.asistente, .proyectos-recientes, .mensaje-hola').fadeOut().remove();
            var oops = jQuery('.mensaje-oops');
            oops.children('p').children('strong.msg').text(msg || "");
            oops.fadeIn();
        }

        this.si_tenemos_camara = function(cb){
            var cmd = 'LANG=C uvcdynctrl -l|grep "No devices found." > /dev/null 2>&1 && echo 1 || echo 0';

            var resultado = exec(cmd, function(error, stdout, stderr) {
                console.log("Resultado de si_tenemos_camara ERR", error);
                console.log("Resultado de si_tenemos_camara STOUT", stdout, typeof(stdout), typeof(parseInt(stdout)), parseInt(stdout) == 0);
                console.log("Resultado de si_tenemos_camara STERR", stderr);
                if( parseInt(stdout) == 1 ){
                    self.abortar("¿Está prendida la cámara?");
                    return;
                }
                else{
                    cb.call(this);
                }
            });
        }

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
                    if( error && error.code == 1 ){
                        console.log("Fallo al capturar", error);
                        self.abortar("no pude capturar capturar imagenes desde la camara");
                        return;
                    }
                    else{
                        self.cuando_obtiene_captura('/tmp/snap.jpg');
                        setTimeout(capturar, 10);
                    }
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
        console.log("Iniciar stream:" + this.camara_id);
        function cuando_falla(error) {
          console.log(error);
          //var video = document.querySelector('video');
          //video.src = 'media/error_camara.webm';
          //video.play();

          capturador = new CapturadorUVC();
          capturador.si_tenemos_camara(capturador.iniciar)
          //capturador.iniciar();
          callback_respuesta("uvc");
        }

        function cuando_obtiene_stream(stream) {
          console.log("Recibio stream");
          if ('srcObject' in video) {
            console.log("usando nwjs > 0.67");
            video.srcObject = stream;                        
          }
          else {
            console.log("fallback nwjs 0.12?");
            video.src = window.URL.createObjectURL(stream);
          }
          callback_respuesta("html5");
        }

        window.URL = window.URL || window.webkitURL;
        //alert(process.versions['node-webkit'])
        if (process.versions['node-webkit'] >='0.12.3') {
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        }
        
        if (navigator.getUserMedia) {
          console.log("Camara_ID: " + this.camara_id);
        
          if (!this.camara_id) {
            var medios = {audio: false, video: true};          
          }
          else {
            var medios = {audio: false, video: {deviceId: {exact: this.camara_id}}};                     
          }

            navigator.getUserMedia(medios, cuando_obtiene_stream, cuando_falla);
        }

    }
});
