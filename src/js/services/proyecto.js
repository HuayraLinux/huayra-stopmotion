var app = angular.module('app');
var fs = require('fs');

app.service('Proyecto', function(Menu, $q) {
    this.frame = null;
    this.sly = null;
    this.fps = 1;

    this.directorio_destino = null;
    this.nombre_del_proyecto = null;
    this.es_proyecto_nuevo = null;
    this.cambios_sin_guardar = null;

    this.contenido_hmotion = {
        titulo: 'Titulo del proyecto',
        cuadros: []
    };

    this.definir_fps = function(fps) {
        this.fps = fps;
    }

    this._definir_titulo = function() {
        if (this.es_proyecto_nuevo)
            var nuevo_titulo = "Sin título";
        else
            var nuevo_titulo = this.nombre_del_proyecto;

        if (this.cambios_sin_guardar)
            nuevo_titulo = "* " + nuevo_titulo;

        document.title = nuevo_titulo;
    }

    this.iniciar = function() {
        // es un numero entre 1000 y 10000.
        var tmp_id = parseInt(Math.random()* 10000 + 1000, 10);

        this.directorio_destino = "/tmp/" + tmp_id + "/";
        this.nombre_del_proyecto = tmp_id;
        this.es_proyecto_nuevo = true;
        this.cambios_sin_guardar = false;
        this._definir_titulo();

        if (!fs.existsSync('/tmp'))
            fs.mkdirSync('/tmp');
            
        fs.mkdirSync(this.directorio_destino);
    }

    this.abrir = function(archivo) {
        var self = this;

        fs.readFile(archivo, 'utf8', function (err, data) {
            if (err) {
                console.log('Error: ' + err);
                return;
            }

            data = JSON.parse(data);

            for (var i=0; i<data.cuadros.length; i++) {
                self.agregar_cuadro(path.join(path.dirname(archivo), data.cuadros[i].ruta));
            }

            self.directorio_destino = path.dirname(archivo);
            self.nombre_del_proyecto = path.basename(archivo, ".hmotion");
            self.es_proyecto_nuevo = false;
            self.cambios_sin_guardar = false;
            Menu.deshabilitar_guardado();
            self._definir_titulo();
        });
    }

    this.guardar = function(ruta_destino) {
        var deferred = $q.defer();
        var nombre_carpeta_imagenes = path.basename(ruta_destino, '.hmotion') + ".imagenes";          /*   ejemplo:  prueba.imagenes    */
        var ruta_carpeta_imagenes = path.join(path.dirname(ruta_destino), nombre_carpeta_imagenes);   /*   ejemplo:  /home/hugo..../prueba.imagenes/ */

        /* Si el directorio no existe lo genera. */
        try {
          fs.statSync(ruta_carpeta_imagenes);
        } catch(err) {
          try {
            fs.mkdirSync(ruta_carpeta_imagenes);
          } catch(err) {
            alert("Imposible guardar el proyecto en esa carpeta.");
          }
        }

        var rutas_a_imagenes_origen = this.obtener_imagenes_desde_sly();
        this.mover_imagenes(rutas_a_imagenes_origen, ruta_carpeta_imagenes);

        this._crear_archivo(ruta_destino, this.contenido_hmotion);

        this.directorio_destino = path.dirname(ruta_destino);
        this.nombre_del_proyecto = path.basename(ruta_destino, ".hmotion");
        this.es_proyecto_nuevo = false;
        this.cambios_sin_guardar = false;
        Menu.deshabilitar_guardado();
        this._definir_titulo();
    }

    this.borrar_cuadro_actual = function() {
        var index = this.sly.rel.activeItem;
        var elemento = this.sly.getPos(index);
        var self = this;

        // Haciendo invisible la imagen del cuadro actual.
        elemento.el.classList.add('eliminando')
        elemento.el.children[0].classList.add('invisible')
        elemento.el.removeChild(elemento.el.children[1]);
        elemento.el.innerHTML += "<img src='img/explosion.gif' class='img-explosion'>"

        setTimeout(function() {
            self.sly.remove(index);

            self.cambios_sin_guardar = true;
            Menu.habilitar_guardado();
            self._definir_titulo();
        }, 400);
    }

    this.mover_imagenes = function(lista_a_imagenes, ruta_carpeta_destino) {
        var self = this;
        this.contenido_hmotion.cuadros = [];

        lista_a_imagenes.map(function(ruta_imagen, index) {
            ruta_imagen = ruta_imagen.split('?')[0];
            ruta_thumb = ruta_imagen.replace("_imagen_", "_imagen_thumb_");
            var nombre_imagen = "imagen_" + index + ".png";
            var nombre_thumb = "imagen_thumb_" + index + ".png";
            var ruta_imagen_destino = path.join(ruta_carpeta_destino, nombre_imagen);
            var ruta_thumb_destino = path.join(ruta_carpeta_destino, nombre_thumb);
            
            try {
                if (ruta_imagen != ruta_imagen_destino) {
                    //fs.renameSync(ruta_imagen, ruta_imagen_destino);
                    fs.createReadStream(ruta_imagen).pipe(fs.createWriteStream(ruta_imagen_destino));
                    fs.createReadStream(ruta_thumb).pipe(fs.createWriteStream(ruta_thumb_destino));
                }
            } catch(err) {
                console.log(err);
            }

            self.contenido_hmotion.cuadros.push({
                ruta: path.join(path.basename(ruta_carpeta_destino), nombre_imagen)
            });
        })
    }

    this.obtener_imagenes_desde_sly = function() {
        // Retorna la ruta a cada imagen dentro del timeline de sly.
        return this.sly.items.map(function(imagen) {
            var ruta = imagen.el.children[0].src.replace('file://', '');
            ruta = ruta.replace('%20', ' ');
            return ruta;
        });
    }

    this._crear_archivo = function(ruta_destino, contenido_json) {
        var data = JSON.stringify(contenido_json, null, 4);
        var onerror = function(e) {console.log(e)};

        fs.writeFile(ruta_destino, data, onerror);
    }


    this.definir_cuadros = function(frame) {
        this.frame = frame;
        this.sly = frame.data('sly');
    }

    this.agregar_cuadro = function(ruta_a_imagen, ruta_a_thumb) {
        //var position = this.sly.rel.activeItem;
        var acciones = "<div class='accion' onclick='borrar()'><i class='icon icon-trash icon-white'></i></div>";
        ruta_a_imagen += '?nocache=' + parseInt(Math.random()* 1000 + 1000, 10);
        ruta_a_thumb += '?nocache=' + parseInt(Math.random()* 1000 + 1000, 10);

        var image = '<li class="cargando"><img onload="mostrar(this, \'RUTA\'); return false" class="img-invisible" src="img/divider.jpg"></img>ACCIONES</li>'.replace('RUTA', ruta_a_imagen).replace('ACCIONES', acciones);
        var thumb = '<li class="cargando"><img onload="mostrar(this, \'RUTA\'); return false" class="img-invisible" src="img/divider.jpg"></img>ACCIONES</li>'.replace('RUTA', ruta_a_thumb).replace('ACCIONES', acciones);
        var a = this.sly.add(image);

        //this.sly.moveBefore(-1, position +1);
        //this.sly.activate(position);

        this.seleccionar_ultimo_cuadro();

        this.cambios_sin_guardar = true;
        Menu.habilitar_guardado();

        this._definir_titulo();
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
        var nombre_thumb = '_imagen_thumb_' + (this.sly.items.length + 1) + '.png';

        // Carga child_process.exec para poder ejecutar comandos
        var exec = require('child_process').exec;
        function exec_log(error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            if (error !== null) {
                console.log('exec error: ' + error);
            }
        };
        
        if (this.es_proyecto_nuevo) {
            var ruta_imagen = path.join(this.directorio_destino, nombre_imagen);
            var ruta_thumb = path.join(this.directorio_destino, nombre_thumb);
        } else {
            // Guarda la imagen en el directorio del proyecto pero con un _ al principio.
            var nombre_carpeta_imagenes = this.nombre_del_proyecto + ".imagenes";
            var ruta_imagen = path.join(this.directorio_destino, nombre_carpeta_imagenes, nombre_imagen);
            var ruta_thumb = path.join(this.directorio_destino, nombre_carpeta_imagenes, nombre_thumb);
        }

        var self = this;

        fs.writeFile(ruta_imagen, image.data, function(err) {
            if (err)
                throw err;

            // Convertir imagen a thumbnail.
            var convert_imagen = 'convert -resize 120 -quality 87 ' + ruta_imagen + " " + ruta_thumb;
            exec(convert_imagen, exec_log);
            self.agregar_cuadro(ruta_imagen, ruta_thumb);
        });

        this.cambios_sin_guardar = true;
        Menu.habilitar_guardado();
    }

    this.calcular_porcentaje = function(frames) {
        var cantidad_imagenes = this.exportar_imagenes().length;
        return Math.round((frames/(cantidad_imagenes * 30)) * 100);
    }

    this.exportar_imagenes = function() {
        var rutas_a_imagenes_origen = this.obtener_imagenes_desde_sly();
        var tmp_id = parseInt(Math.random()* 1000 + 1000, 10);
        var directorio_temporal = '/tmp/prueba' + tmp_id;

        fs.mkdirSync(directorio_temporal);

        rutas_a_imagenes_origen.map(function(ruta_imagen, index) {
            ruta_imagen = ruta_imagen.split('?')[0];
            var nombre_imagen = index + ".png";
            var ruta_imagen_destino = path.join(directorio_temporal, nombre_imagen);

            is = fs.createReadStream(ruta_imagen);
            os = fs.createWriteStream(ruta_imagen_destino);

            is.pipe(os);
        });

        return directorio_temporal;
    }

});
