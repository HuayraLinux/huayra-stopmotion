'use strict';

window.onerror = function(e) {alert(e)};

var gui = require('nw.gui');
var fs = require('fs');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var utils = require('./js/utils');
var exec = require('child_process').exec;

var mostrar_herramientas_de_desarrollo = function() {
    var w = gui.Window.get();
    w.showDevTools();
}

var app = angular.module('app', ['ngAnimate', 'ui.bootstrap']);
var ventana = gui.Window.get();


window.mostrar = function(elemento) {
    /* Se ejecuta cuando la imagen del timeline está lista para ser mostrada. */

    setTimeout(function() {
        elemento.classList.remove('img-invisible');
        elemento.classList.add('img-visible');
        elemento.parentElement.classList.remove('cargando');
    }, 300);
}


app.controller('AppCtrl', function ($scope, $modal, Paneles, Preferencias, Proyecto, Menu) {
    $scope.proyectos_recientes = Preferencias.data.proyectos_recientes;

    $scope.brillo = 50;
    $scope.contraste = 50;
    $scope.borrosidad = 0;
    $scope.saturacion = 0;
    $scope.capturar_habilitado = true;

    $scope.tab_seleccionado = "tab1";
    $scope.titulo = "Sin título";
    $scope.sonido_habilitado = true;
    $scope.camaras = [];
    $scope.camara_seleccionada = 1;
    $scope.panel_visible = true;
    $scope.puerto_remoto = "???";
    $scope.host = "";
    $scope.en_reproduccion = false;
    $scope.fps = 10;
    $scope.cargado = false;

    $scope.$watch('fps', function() {
        Proyecto.definir_fps($scope.fps);
    });

    $scope.menu_captura = [
        {demora:  2, titulo: "Capturar cada 2 segundos"},
        {demora:  5, titulo: "Capturar cada 5 segundos"},
        {demora: 20, titulo: "Capturar cada 20 segundos"},
        {demora: 60, titulo: "Capturar cada 1 minuto"},
    ];

    $scope.iniciar_captura_con_intervalo = function(demora_en_segundos) {
        alert("iniciar captura cada " + demora_en_segundos + " segundos...");
    }


    Menu.agregar_a_ventana(ventana,
                           function(){$scope.cuando_selecciona_exportar()},
                           function(){$scope.cuando_selecciona_acerca_de()}
                           );


    var ModalCerrarCtrl = function($scope, $modalInstance) {

        $scope.guardar = function() {
            window.guardar_proyecto_como();
            $modalInstance.close();
        }

        $scope.cancelar = function() {
            $modalInstance.close();
        }

        $scope.salir = function() {
            gui.App.quit();
        }

    }

    ventana.on("close", function() {

        if (Proyecto.cambios_sin_guardar) {

            var modalInstance = $modal.open({
                templateUrl: 'partials/modal_cerrar.html',
                controller: ModalCerrarCtrl,
                resolve: {
                    es_proyecto_nuevo: $scope.es_proyecto_nuevo,
                }
            });

        } else {
            gui.App.quit();
        }

    });

    var ModalAcercaDeCtrl = function($scope, $modalInstance) {
        $scope.cerrar = function() {
            $modalInstance.close();
        }
    }

    var ModalExportarCtrl = function($scope, $modalInstance, proyecto) {
        $scope.pagina = "preferencias";
        $scope.proyecto = proyecto;
        $scope.progreso_cantidad = 0;

        $scope.formatos = [
            {nombre: "MP4",  identificador: "mpeg4", extension: ".mp4"},
            {nombre: "GIF", identificador: "gif", extension: ".gif"}
        ];

        $scope.sizes = [
            {nombre: "100%", identificador: 100},
            {nombre: "50%",  identificador: 50},
            {nombre: "25%",  identificador: 25}
        ];

        $scope.formato = $scope.formatos[0];
        $scope.size = $scope.sizes[0];

        $scope.exportar_video = function(proyecto, formato, size) {
            var dialogo_exportar = document.getElementById('dialogo-exportar');

            function abrir_dialogo_exportar(proyecto, formato) {

                var dialogo = document.getElementById('dialogo-exportar');

                // Itentando cambiar el nombre de archivo a grabar.
                dialogo.setAttribute('accept', formato.extension);
                dialogo.setAttribute('nwsaveas', 'ejemplo' + formato.extension);

                dialogo.click();

                dialogo.onchange = function(evento) {
                    var archivo = this.value;
                    this.value = "";

                    var directorio_temporal = proyecto.exportar_imagenes();

                    switch (formato.nombre) {
                            case "MP4":
                                var tamano = size.identificador + '%';
                                var proc = new ffmpeg({ source: path.join(directorio_temporal, "%d.png"), nolog: true})
                                       .withVideoCodec(formato.identificador)
                                       .withFpsInput(proyecto.fps)
                                       .withFps(30)
                                       //.withSize('50x50')
                                       .onProgress(function(data, i) {
                                           $scope.progreso_cantidad = proyecto.calcular_porcentaje(data.frames);
                                           $scope.$apply();
                                       })
                                       .saveToFile(archivo, function(stdout, stderr, err){
                                           $scope.progreso_cantidad = 100;
                                           $scope.pagina = "finalizado";
                                           $scope.$apply();
                                       });
                            break;

                            case "GIF":
                                $scope.progreso_cantidad = 10;
                                var delay = Math.floor(100 / proyecto.fps);
                                var archivos = proyecto.obtener_imagenes_desde_sly().join(" ");
                                var comando = 'convert -delay ' + delay + ' -loop 0 -resize "' + size.identificador + '%" ' + archivos + ' ' + archivo;

                                exec(comando, function(error, stdout, stderr) {
                                    $scope.progreso_cantidad = 100;
                                    $scope.pagina = "finalizado";
                                    $scope.$apply();

                                    //console.log('stdout: ' + stdout);
                                    //console.log('stderr: ' + stderr);

                                    if (error !== null) {
                                        alert(error);
                                    }
                                });
                            break;

                            default:
                                alert("ERROR, el formato " + $scope.formato.nombre + " no está implementado");
                            break;
                    }

                    $scope.pagina = "progreso";
                    $scope.$apply();
                }
            }

            abrir_dialogo_exportar(proyecto, formato);
        }

        $scope.cancelar = function() {
            $modalInstance.close();
        }

        $scope.cerrar = function() {
            $modalInstance.close();
        }
    }



    $scope.cuando_selecciona_exportar = function() {

        var modalInstance = $modal.open({
            templateUrl: 'partials/modal_exportar.html',
            controller: ModalExportarCtrl,
            resolve: {
                proyecto: function() {return Proyecto}
            }
        });

    }

    $scope.cuando_selecciona_acerca_de = function() {

        var modalInstance = $modal.open({
            templateUrl: 'partials/modal_acerca_de.html',
            controller: ModalAcercaDeCtrl
        });

    }



         setTimeout(function() {

             $scope.cargado = true;
             $scope.$apply();

         }, 3000);


    $scope.abrir_proyecto = function(ruta, ocultar_pantalla) {
        window.abrir_proyecto_desde_ruta(ruta, ocultar_pantalla);
    }

    $scope.reproducir = function() {
        $scope.en_reproduccion = true;

        function solicitar_siguiente_cuadro() {

            if ($scope.en_reproduccion) {
                avanzar_continuamente_un_cuadro();
                setTimeout(solicitar_siguiente_cuadro, 1000 / $scope.fps);
            }
        }

        solicitar_siguiente_cuadro();
    }

    $scope.detener = function() {
        $scope.en_reproduccion = false;
    }

    $scope.abrir_pantalla_compartida_en_el_navegador = function() {
        var url = 'http://' + $scope.host + ':' + $scope.puerto_remoto;
        gui.Shell.openExternal(url);
    }

    $scope.pulsa_boton_alternar_ayuda = Paneles.alternar_ayuda;

    //$scope.pulsa_boton_alternar_ayuda = function() {
        //alternar_panel_ayuda();
    //}

    $scope.pulsa_boton_alternar_panel = function() {
        $scope.panel_visible = !$scope.panel_visible;
        Paneles.alternar_panel_lateral();
    }


    $scope.directorio_destino = null;
    $scope.nombre_del_proyecto = null;
        $scope.es_proyecto_nuevo = null;
        $scope.cambios_sin_guardar = null;


    $scope.fantasma = true;
    $scope.fantasma_opacidad = 50;

    $scope.getNumber = function(num) {
        return new Array(num);
    }

    $scope.capa_grilla_opacidad = 50;
    $scope.capa_grilla_cantidad_filas = 2;
    $scope.capa_grilla_cantidad_columnas = 2;

    $scope.deshabilitar_capas = function() {
        $scope.capa_grilla_opacidad = 0;
        $scope.fantasma_opacidad = 0;
    }

    $scope.$watch('capa_grilla_opacidad', function() {
        var table = document.getElementById('table');
        table.style.opacity = $scope.capa_grilla_opacidad / 100;
    });

    $scope.$watch('fantasma_opacidad', function() {
        var canvas = document.getElementById('canvas');
        canvas.style.opacity = $scope.fantasma_opacidad / 100;
    });

    $scope.restaurar = function () {
        $scope.brillo = 50;
        $scope.contraste = 50;
        $scope.borrosidad = 0;
        $scope.saturacion = 0;
    }

    $scope.seleccionar_tab = function (numero) {
        $scope.tab_seleccionado = "tab" + numero;
    }

    $scope.seleccionar_camara = function (numero) {
        if (numero)
            $scope.detener();

        $scope.camara_seleccionada = numero;
    }

    $scope.seleccionar_camara(1);

    function actualizar_efectos(_old, _new) {
        var video = document.querySelector('video');
        var borrosidad = "blur(" + $scope.borrosidad / 10.0 + "px) ";
        var brillo = "brightness(" + $scope.brillo / 50 + ") ";
        var contraste = "contrast(" + $scope.contraste / 50 + ") ";
        //var saturacion = "saturate(" + $scope.saturacion / 50 + ") ";

        video.style.webkitFilter = borrosidad + brillo + contraste;
        //+ saturacion;
    }

    $scope.$watch('borrosidad', actualizar_efectos);
    $scope.$watch('brillo', actualizar_efectos);
    $scope.$watch('contraste', actualizar_efectos);
    $scope.$watch('saturacion', actualizar_efectos);

    $scope.cuadros = [
    ];

    function convertCanvasToImage(canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        return image;
    }

    function dibujar_imagen_sobre_canvas(image, canvas) {
        var contexto = canvas.getContext('2d');
        contexto.drawImage(image, 0, 0);
    }

    var contador_item = 0;

    $scope.capturar = function() {

        // Deshabilitando temporalmente la captura de cuadros nuevos (por medio segundo).
        if (! $scope.capturar_habilitado) {return;}
        $scope.capturar_habilitado = false;
        setTimeout(function() {$scope.capturar_habilitado = true;}, 500);


        contador_item += 1;
        $scope.cuadro_seleccionado = contador_item;

        var canvas = document.getElementById("canvas");
        var previsualizado = document.getElementById("previsualizado");

        dibujar_imagen_sobre_canvas(video, canvas);
        dibujar_imagen_sobre_canvas(video, previsualizado);

        // TODO: Canvas de la camara activa
        var imagen = convertCanvasToImage(canvas);

        Proyecto.guardar_cuadro(imagen.src);

        // Reproduce el sonido de captura de pantalla.
        if ($scope.sonido_habilitado) {
            var sonido_foto = window.document.getElementById('audio_foto');
            sonido_foto.currentTime=0;
            sonido_foto.play();
        }
    };

    /*
   * Retorna el cuadro en formato JSON buscando por id.
   *
   * El resultado es de la forma:
   *
   *
   */
    function obtener_cuadro_por_id(id) {
        for (var i=0; i<$scope.cuadros.length; i++) {
            if ($scope.cuadros[i].id == id)
                return $scope.cuadros[i];
        }
    }


    /* Oculta el panel de ayuda si se hace click */
    var ayuda = document.getElementById('ayuda');
    ayuda.onclick = Paneles.alternar_ayuda;

    var $frame  = jQuery('#basic');
    var $slidee = $frame.children('ul').eq(0);
    var $wrap   = $frame.parent();

    window.calculateAspectRatioFit = function(srcWidth, srcHeight, maxWidth, maxHeight) {
        var ratio = [maxWidth / srcWidth, maxHeight / srcHeight ];
        ratio = Math.min(ratio[0], ratio[1]);

        return {width: Math.floor(srcWidth*ratio), height: Math.floor(srcHeight*ratio)};
    }

    window.ajustar_capas = function() {
        var contenedor_interno = document.getElementById('contenedor_interno');
        var previsualizar = document.getElementById('previsualizado');
        var canvas = document.getElementById('canvas');
        var table = document.getElementById('table');
        var imagen_remota = document.getElementById('imagen_remota');

        var size = calculateAspectRatioFit(canvas.width, canvas.height, contenedor_interno.clientWidth, contenedor_interno.clientHeight);

        function calcularMitad(longitud, en_negativo) {
            var en_negativo = en_negativo || false;
            var longitud_como_numero = parseInt(longitud, 10) / 2;

            if (en_negativo)
                longitud_como_numero = -longitud_como_numero;

            return Math.floor(longitud_como_numero) + "px";
        }

        table.style.width = size.width + "px";
        table.style.left = '50%';
        table.style.marginLeft = calcularMitad(table.style.width, true);
        table.style.height = size.height + "px";

        video.style.left = table.style.left;
        video.style.width = table.style.width;
        video.style.height = table.style.height;
        video.style.marginLeft = table.style.marginLeft;

        previsualizar.style.left = table.style.left;
        previsualizar.style.width = table.style.width;
        previsualizar.style.height = table.style.height;
        previsualizar.style.marginLeft = table.style.marginLeft;

        canvas.style.left = table.style.left;
        canvas.style.width = table.style.width;
        canvas.style.height = table.style.height;
        canvas.style.marginLeft = table.style.marginLeft;

        imagen_remota.style.left = table.style.left;
        imagen_remota.style.width = table.style.width;
        imagen_remota.style.height = table.style.height;
        imagen_remota.style.marginLeft = table.style.marginLeft;
    }

    window.onresize = function() {
        Proyecto.frame.sly('reload')
        ajustar_capas();
    }

    setInterval(ajustar_capas, 100);

    // Call Sly on frame
    $frame.sly({
        horizontal: 1,
        itemNav: 'basic',
        smart: 1,
        activateOn: 'click',
        mouseDragging: 1,
        touchDragging: 1,
        releaseSwing: 1,
        startAt: 0,
        scrollBar: $wrap.find('.scrollbar'),
        scrollBy: 1,
        pagesBar: $wrap.find('.pages'),
        activatePageOn: 'click',
        speed: 300,
        elasticBounds: 1,
        easing: 'easeOutExpo',
        dragHandle: 1,
        dynamicHandle: 1,
        clickBar: 1,
    });

    //Proyecto.frame = $frame;
    //Proyecto.sly = $frame.data('sly');

        Proyecto.definir_cuadros($frame);

    window.frame = Proyecto.frame;
    window.sly = Proyecto.sly;

    Proyecto.sly.on('active', function(e, indice) {
        var canvas = document.getElementById("canvas");
        var previsualizado = document.getElementById("previsualizado");
        var item = Proyecto.sly.getPos(indice);
        var imagen = item.el.children[0];

        dibujar_imagen_sobre_canvas(imagen, canvas);
        dibujar_imagen_sobre_canvas(imagen, previsualizado);
    })


    /*
   * Atajos de teclado.
   *
   */
  key('n', function(){
      $scope.panel_visible = !$scope.panel_visible;
      $scope.$apply();
            Paneles.alternar_panel_lateral();
  });

    key('h', Paneles.alternar_ayuda);

    key("space", function(){
        $scope.capturar();
        $scope.$apply();
    });

    key("left", function(){
        Proyecto.frame.sly('prev');
    });

    key("right", function(){
        Proyecto.frame.sly('next');
    });

    key("up", function(){
        Proyecto.sly.activate(0);
    });

    function avanzar_continuamente_un_cuadro() {
        var pos = Proyecto.sly.rel.activeItem;
        Proyecto.sly.next();

        var nuevaPos = Proyecto.sly.rel.activeItem;

        if (pos == nuevaPos)
            Proyecto.sly.activate(0);
    }

    key("down", function(){
        avanzar_continuamente_un_cuadro();
    });

    key("x", function() {
        Proyecto.sly.remove(Proyecto.sly.rel.activeItem);
    });



    $scope.abrir_modo_desarrollador = function() {
        var gui = require('nw.gui');
        var w = gui.Window.get();
        w.showDevTools();
    }

    window.borrar = function() {
        Proyecto.borrar_cuadro_actual();

        // Reproduce el sonido de borrado de cuadro.
        if ($scope.sonido_habilitado) {
            var sonido = window.document.getElementById('audio_borrar');
            sonido.currentTime=0;
            sonido.play();
        }
    }


    window.iniciar_nuevo_proyecto = function() {
        Proyecto.iniciar();
    }

    window.abrir_proyecto_desde_ruta = function(archivo, ocultar_pantalla){
        /* Si hay cuadros cargados limpia todo */
        var cantidad_de_cuadros = Proyecto.sly.items.length;

        for (var i=0; i<cantidad_de_cuadros; i++) {
            Proyecto.sly.remove(0);
        }

        /* Inicia la carga del archivo */
        Proyecto.abrir(archivo);

        if (ocultar_pantalla)
            ocultar_pantalla_inicial();

        ajustar_capas();
    }

    window.abrir_proyecto = function(success_callback) {
        var openDialog = document.getElementById('open-dialog');
        openDialog.click();

        openDialog.onchange = function(evento) {
            var archivo = this.value;
            this.value = ""; // Hace que se pueda seleccionar el archivo nuevamente.
            abrir_proyecto_desde_ruta(archivo, success_callback);
        }
    }

    $scope.guardar_proyecto = function() {
        window.guardar_proyecto();
    }

    window.guardar_proyecto = function() {
        if (Proyecto.es_proyecto_nuevo) {
            guardar_proyecto_como();
        } else {
            var archivo = path.join(Proyecto.directorio_destino, Proyecto.nombre_del_proyecto + ".hmotion");

            Proyecto.guardar(archivo);
            Preferencias.agregar_proyecto_reciente(archivo);
            $scope.abrir_proyecto(archivo);
        }
    }

    window.guardar_proyecto_como = function() {
        var saveDialog = document.getElementById('save-dialog');
        saveDialog.click();

        saveDialog.onchange = function(evento) {
            var archivo = this.value;
            this.value = '';
            Proyecto.guardar(archivo);
            Preferencias.agregar_proyecto_reciente(archivo);
            $scope.abrir_proyecto(archivo);
        }
    }

    function ocultar_pantalla_inicial() {
        jQuery('.panel-inicial').fadeOut();
    }

    $scope.ocultar_pantalla_incial = ocultar_pantalla_inicial;

    var boton_iniciar_proyecto = document.getElementById('boton_iniciar_proyecto');

    boton_iniciar_proyecto.onclick = function() {
            ocultar_pantalla_inicial();
            iniciar_nuevo_proyecto();
        }

    var boton_abrir_proyecto = document.getElementById('boton_abrir_proyecto');

    boton_abrir_proyecto.onclick = function() {
            abrir_proyecto(ocultar_pantalla_inicial);
        }

    var config = require('./package.json');

    if (config.compartir) {
        var express = require('express');
        var http = require('http');

        var app = express();
        var server = http.createServer(app);

        app.configure(function(){
            app.set('port', 3000 + Math.floor(Math.random() * 1000));
            app.use(express.static('./public'));
        });

        server.listen(app.get('port'), function(){
            var os = require("os");

            console.log("Comenzando a escuchar en el puerto: " + app.get('port'));

            $scope.puerto_remoto = app.get('port');
            $scope.host = os.hostname();

            // Si el hostname no dice '.local' lo agrega.
            // (esto surge en linux, en mac el hostname ya tiene '.local')
            if ($scope.host.search('.local') == -1)
                $scope.host += ".local";

            $scope.$apply();
        });

        var io = require("socket.io").listen(server);

        io.sockets.on('connection', function (socket) {

            $scope.camaras.push({
                indice: $scope.camaras.length + 1,
                socket: socket,
                id: socket.id,
            });

            $scope.$apply();

            socket.on('disconnect', function() {
                alert("TODO: buscar la camara");
                $scope.camaras.splice(0, 1);
                $scope.$apply();
            });

            socket.on("captura", function(data) {
                var imagen_remota = document.getElementById('imagen_remota');

                var buffer = data.data;
                imagen_remota.src = buffer;

                // Avisa que la captura llegó correctamente, así el navegador
                // le puede enviar la siguiente captura.
                socket.emit("capturaSuccess", {ok: true});
            });
        });
    }

});
