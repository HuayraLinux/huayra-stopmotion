var app = angular.module('app');

var fs = require('fs');

app.service('Proyecto', function() {
    this.frame = null;
    this.sly = null;

    this.directorio_destino = null;
    this.nombre_del_proyecto = null;
    this.es_proyecto_nuevo = null;
    this.cambios_sin_guardar = null;


    this.iniciar = function() {
        // es un numero entre 1000 y 2000.
        var tmp_id = parseInt(Math.random()* 1000 + 1000, 10);

        this.directorio_destino = "/tmp/" + tmp_id + "/";
        this.nombre_del_proyecto = tmp_id;
        this.es_proyecto_nuevo = true;
        this.cambios_sin_guardar = false;

        fs.mkdir(this.directorio_destino);
    }

    this.abrir = function(archivo) {
        fs.readFile(archivo, 'utf8', function (err, data) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }

            data = JSON.parse(data);

            for (var i=0; i<data.cuadros.length; i++) {
                this.agregar_cuadro(path.join(path.dirname(archivo), data.cuadros[i].ruta));
            }

            this.directorio_destino = path.dirname(archivo);
            this.nombre_del_proyecto = path.basename(archivo, ".hmotion");
            this.es_proyecto_nuevo = false;
            this.cambios_sin_guardar = false;
        });
    }

    this.guardar = function(ruta) {
    }

	this.definir_cuadros = function(frame) {
		this.frame = frame;
		this.sly = frame.data('sly');
	}

    this.agregar_cuadro = function(ruta_a_imagen) {
        var position = this.sly.rel.activeItem;
        var acciones = "<div class='accion' onclick='borrar()'><i class='icon icon-trash icon-white'></i></div>";
        var image = '<li><img src="' + ruta_a_imagen + '"></img>' + acciones + '</li>';
        var a = this.sly.add(image);

        this.sly.moveBefore(-1, position +1);
        this.sly.activate(position);
        this.seleccionar_ultimo_cuadro();
    }

    this.seleccionar_ultimo_cuadro = function() {
        this.sly.activate(sly.items.length - 1);
    }


    this._decodeBase64Image = function(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        return response;
    }

    this.guardar_cuadro = function(image_src) {
        var image = this._decodeBase64Image(image_src);

        var nombre_imagen = '_imagen_' + (this.sly.items.length + 1) + '.png';
        var ruta_imagen = this.directorio_destino + nombre_imagen;

        var self = this;
        fs.writeFile(ruta_imagen, image.data, function(err) {
            if (err) throw err;
            self.agregar_cuadro(ruta_imagen);
        });

        this.cambios_sin_guardar = true;
    }

});
