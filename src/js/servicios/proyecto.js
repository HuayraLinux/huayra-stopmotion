var app = angular.module('app');

var fs = require('fs');

app.service('Proyecto', function() {
    this.frame = null;
    this.sly = null;
    this.fps = 1;

    this.directorio_destino = null;
    this.nombre_del_proyecto = null;
    this.es_proyecto_nuevo = null;
    this.cambios_sin_guardar = null;
    
    this.definir_fps = function(fps) {
        this.fps = fps;
    }
    
    this._definir_titulo = function() {
        var nuevo_titulo = this.nombre_del_proyecto;
        if (this.es_proyecto_nuevo)
            var nuevo_titulo = "Sin título";
        else
            var nuevo_titulo = this.nombre_del_proyecto;
        
        if (this.cambios_sin_guardar)
            nuevo_titulo = "* " + nuevo_titulo;
            
        document.title = nuevo_titulo;
    }

    this.iniciar = function() {
        // es un numero entre 1000 y 2000.
        var tmp_id = parseInt(Math.random()* 1000 + 1000, 10);

        this.directorio_destino = "/tmp/" + tmp_id + "/";
        this.nombre_del_proyecto = tmp_id;
        this.es_proyecto_nuevo = true;
        this.cambios_sin_guardar = false;
        this._definir_titulo();
        
        fs.mkdir(this.directorio_destino);
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
            self._definir_titulo();
        });
    }

    this.guardar = function(ruta_destino) {
        
        var contenido_hmotion = {
            titulo: 'Titulo del proyecto',
            cuadros: []
        };
        
        if (this.es_proyecto_nuevo) {
      			var nombre_carpeta_imagenes = path.basename(ruta_destino, '.hmotion') + ".imagenes";          /*   ejemplo:  prueba.imagenes    */
            var ruta_carpeta_imagenes = path.join(path.dirname(ruta_destino), nombre_carpeta_imagenes);   /*   ejemplo:  /home/hugo..../prueba.imagenes/ */
            
            // Crear el directorio de las imagenes.
            fs.mkdir(ruta_carpeta_imagenes);
            
            var rutas_a_imagenes_origen = this.obtener_imagenes_desde_sly();
            
            rutas_a_imagenes_origen.map(function(ruta_imagen, index) {
                var nombre_imagen = "imagen_" + index + ".png";
                var ruta_imagen_destino = path.join(ruta_carpeta_imagenes, nombre_imagen);
                
                fs.renameSync(ruta_imagen, ruta_imagen_destino);
                
                contenido_hmotion.cuadros.push({
                    ruta: path.join(nombre_carpeta_imagenes, nombre_imagen)
                });
            })
             
        } else {
            alert("No implementado aún");
        }
        
        this._crear_archivo(ruta_destino, contenido_hmotion);
        
        this.directorio_destino = path.dirname(ruta_destino);
        this.nombre_del_proyecto = path.basename(ruta_destino, ".hmotion");
        this.es_proyecto_nuevo = false;
        this.cambios_sin_guardar = false;
        
        this._definir_titulo();
    }
    
    this.obtener_imagenes_desde_sly = function() {
        // Retorna la ruta a cada imagen dentro del timeline de sly.
        return this.sly.items.map(function(imagen) {
            return imagen.el.children[0].src.replace('file://', '');
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

    this.agregar_cuadro = function(ruta_a_imagen) {
        var position = this.sly.rel.activeItem;
        var acciones = "<div class='accion' onclick='borrar()'><i class='icon icon-trash icon-white'></i></div>";
        var image = '<li><img src="' + ruta_a_imagen + '"></img>' + acciones + '</li>';
        var a = this.sly.add(image);

        this.sly.moveBefore(-1, position +1);
        this.sly.activate(position);
        this.seleccionar_ultimo_cuadro();
        
        this.cambios_sin_guardar = true;
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
        var ruta_imagen = this.directorio_destino + nombre_imagen;

        var self = this;
        
        fs.writeFile(ruta_imagen, image.data, function(err) {
            if (err) throw err;
            self.agregar_cuadro(ruta_imagen);
        });

        this.cambios_sin_guardar = true;
    }
    
    this.calcular_porcentaje = function(frames) {
        console.log("test!");
        var cantidad_imagenes = this.exportar_imagenes().length;
        return Math.round((frames/(cantidad_imagenes * 30)) * 100);
    }
    
    this.exportar_imagenes = function() {
        var rutas_a_imagenes_origen = this.obtener_imagenes_desde_sly();
        var tmp_id = parseInt(Math.random()* 1000 + 1000, 10);
        var directorio_temporal = '/tmp/prueba' + tmp_id;
        
        fs.mkdirSync(directorio_temporal);
            
        rutas_a_imagenes_origen.map(function(ruta_imagen, index) {
            var nombre_imagen = index + ".png";
            var ruta_imagen_destino = path.join(directorio_temporal, nombre_imagen);
                
            is = fs.createReadStream(ruta_imagen);
            os = fs.createWriteStream(ruta_imagen_destino);
            
            is.pipe(os);
        });
                                    
        return directorio_temporal;
    }

});
