'use strict';
var app = angular.module('app', ['ngAnimate', 'ui.bootstrap']);

var gui = require('nw.gui');
var fs = require('fs');

var ffmpeg = require('fluent-ffmpeg');


var ventana = gui.Window.get();

ventana.on("close", function() {
  gui.App.quit();
});

app.filter('range', function() {
  return function(arr, lower, upper) {
    for (var i = lower; i <= upper; i++){
      arr.push(i);
    }
    return arr;
  };
});

app.filter('incrementar', function() {
  return function(input) {
    return parseInt(input, 10) + 1;
    ;
  };
});

app.controller('AppCtrl', function ($scope) {
  $scope.brillo = 50;
  $scope.contraste = 50;
  $scope.borrosidad = 0;
  $scope.saturacion = 0;
  $scope.tab_seleccionado = "tab1";
	$scope.titulo = "Sin título";
  $scope.sonido_habilitado = true;
  $scope.camaras = [];
  $scope.camara_seleccionada = 1;
	$scope.panel_visible = true;
  $scope.puerto_remoto = "???";
	
	
	$scope.pulsa_boton_alternar_ayuda = function() {
		alternar_panel_ayuda();
	}
	
	$scope.pulsa_boton_alternar_panel = function() {
		$scope.panel_visible = !$scope.panel_visible;
		alternar_panel_lateral();
	}

  // TODO: reemplazar por un identificador único.
  $scope.proyecto_id = parseInt(Math.random()* 1000 + 1000, 10); // es un numero entre 1000 y 2000.
  $scope.directorio_destino = "/tmp/" + $scope.proyecto_id + "/";

  fs.mkdir($scope.directorio_destino);
  
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
  }
  
  $scope.$watch('capa_grilla_opacidad', function() {
    var table = document.getElementById('table');
    table.style.opacity = $scope.capa_grilla_opacidad / 100;
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


  function explorar_directorio(ruta_relativa_al_archivo) {
    //var path = require('path');
    var root = './'; //path.resolve( './' ) + '/'; 

    ruta_relativa_al_archivo = ruta_relativa_al_archivo || '';
    gui.Shell.showItemInFolder(root + ruta_relativa_al_archivo)
  }

  $scope.generar_video = function() {

    var proc = new ffmpeg({ source: $scope.directorio_destino + '%d.png', nolog: true })
      .withVideoCodec('mpeg4')
      .withFpsInput(3)
      .withFps(10)
      .saveToFile($scope.directorio_destino + 'test.mpeg', function(retcode, stdout){
        explorar_directorio($scope.directorio_destino + 'test.mpeg');
    }); 
  }

  $scope.abrir_directorio_destino = function() {
    explorar_directorio('./' + $scope.directorio_destino);
  }
  
  $scope.seleccionar_ultimo_cuadro = function() {
    $scope.sly.activate(sly.items.length - 1);
  }
  
  $scope.capturar = function() {
    contador_item += 1;
    $scope.cuadro_seleccionado = contador_item;
    
    var canvas = document.getElementById("canvas");
    var previsualizado = document.getElementById("previsualizado");
    
    dibujar_imagen_sobre_canvas(video, canvas);
    dibujar_imagen_sobre_canvas(video, previsualizado);
    
    var imagen = convertCanvasToImage(canvas);
    
    
    
    
    

    function decodeBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
          response = {};

      if (matches.length !== 3) {
        return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
    }

    var nombre_imagen = contador_item + '.png'
    var imageBuffer = decodeBase64Image(imagen.src);

    fs.writeFile($scope.directorio_destino + nombre_imagen, imageBuffer.data, function(err) {
      $scope.cuadros.push({id: contador_item, nombre: 'nuevo', src: $scope.directorio_destino + imagen.src});
      $scope.frame.sly('add', '<li><img src="' + $scope.directorio_destino + nombre_imagen + '"></img></li>');
      ajustar_capas();
      $scope.$apply();
      $scope.seleccionar_ultimo_cuadro();
    });
    

    // Reproduce el sonido de captura de pantalla.
    if ($scope.sonido_habilitado) {
    	var sonido = window.document.getElementById('audio_foto');
      sonido.currentTime=0;
      sonido.play();
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
  
	
	window.alternar_panel_lateral = function() {
		var panel = document.getElementById('panel-lateral');
  	var contenedor = document.getElementById('contenedor-layers');
  	var controles = document.getElementById('contenedor-controles');

		panel.classList.toggle('panel-lateral-invisible');
		contenedor.classList.toggle('contenedor-layers-expandido');
		controles.classList.toggle('contenedor-controles-expandido');
	}
	
  window.alternar_panel_ayuda = function() {
		var ayuda = document.getElementById('ayuda');

		ayuda.classList.toggle('ayuda-invisible');
  }

	/* Oculta el panel de ayuda si se hace click */
	var ayuda = document.getElementById('ayuda');
	ayuda.onclick = alternar_panel_ayuda;
	
	
	var $frame  = jQuery('#basic');
	var $slidee = $frame.children('ul').eq(0);
	var $wrap   = $frame.parent();

  
  window.ajustar_capas = function() {
    var previsualizar = document.getElementById('previsualizado');
    var canvas = document.getElementById('canvas');
    var table = document.getElementById('table');
    
    table.width = canvas.clientWidth;
    table.style.left = '50%';
    table.style.marginLeft = -table.width / 2 + "px";
    
    table.style.height = canvas.clientHeight + "px"; 
    
    video.style.left = table.style.left;
    video.style.height = table.style.height;
    video.style.width = table.width;
    video.style.marginLeft = -table.width / 2 + "px";
    
    previsualizar.style.left = table.style.left;
    previsualizar.style.height = table.style.height;
    previsualizar.style.width = table.width;
    previsualizar.style.marginLeft = -table.width / 2 + "px";
  }

    window.onresize = function(){
      $scope.frame.sly('reload')
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

    $scope.frame = $frame;
  	$scope.sly = $frame.data('sly');

    window.frame = $frame;
  	window.sly = $scope.sly;
  
  $scope.sly.on('active', function(e, indice) {
    var canvas = document.getElementById("canvas");
    var previsualizado = document.getElementById("previsualizado");
  	var item = $scope.sly.getPos(indice);
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
		alternar_panel_lateral()
	});

	key('h', function(){
		alternar_panel_ayuda();
	});

  key("space", function(){
    $scope.capturar();
    $scope.$apply();
  });

  key("left", function(){
    $scope.frame.sly('prev');
  });

  key("right", function(){
    $scope.frame.sly('next');
  });

  key("up", function(){
    $scope.sly.activate(0);
  });

  key("down", function(){
    var pos = $scope.sly.rel.activeItem;
    $scope.sly.next();
    
    var nuevaPos = $scope.sly.rel.activeItem;
    
    if (pos == nuevaPos)
      $scope.sly.activate(0);
  });


  $scope.abrir_modo_desarrollador = function() {
    var gui = require('nw.gui');
    var w = gui.Window.get();
    w.showDevTools();
  }
	

	window.iniciar_nuevo_proyecto = function() {
		jQuery('.panel-inicial').fadeOut();
	}
  
  window.abrir_proyecto = function() {
    var openDialog = document.getElementById('open-dialog');
    openDialog.click();

    openDialog.onchange = function(evento) {
      var archivo = this.value;
      this.value = ""; // Hace que se pueda seleccionar el archivo nuevamente.
      
      if (/.hmotion$/.test(archivo)) {
        console.log("Abrir el archivo " + archivo);
      	alert(archivo);
      } else {
        alert("Lo siento, solo puedo leer archivos del formato .hmotion");
      }
    }
  }
	
	var boton_iniciar_proyecto = document.getElementById('boton_iniciar_proyecto');
	boton_iniciar_proyecto.onclick = iniciar_nuevo_proyecto;
  
  var boton_abrir_proyecto = document.getElementById('boton_abrir_proyecto');
  boton_abrir_proyecto.onclick = abrir_proyecto;
	
	
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
			console.log("Comenzando a escuchar en el puerto: " + app.get('port'));
			$scope.puerto_remoto = app.get('port');
			$scope.$apply();
		});
	
		var io = require("socket.io").listen(server);
	
		io.sockets.on('connection', function (socket) {
	
			$scope.camaras.push({
				indice: 2,
				socket: socket,
			});
	
			$scope.$apply();
	
			socket.on('disconnect', function() {
				$scope.camaras.splice(0, 1);
				$scope.$apply();
			});
	
			socket.on("mensaje", function(data) {
				console.log(data);
			});
		});
	}

});
