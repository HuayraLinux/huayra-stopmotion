import Ember from 'ember';
const Promise = Ember.RSVP.Promise;

var optionalImports;

try {
  optionalImports = {
    v4l2: requireNode('v4l2camera'),
    udev: requireNode('udev')
  };
  console.log('Cargadas las librerías nativas');
} catch (e) { /* Debería catchear ÚNICAMENTE el caso de que falle el require */
  optionalImports = {
    v4l2: {},
    udev: {
      list() {
        return [{
          SUBSYSTEM: 'video4linux',
          DEVNAME: '/dev/video0',
          ID_V4L_CAPABILITIES: ':capture:'
        }]; /* Cámara de prueba */
      },

      monitor() {
        return { /* Fake monitor*/
          on() {
          }
        };
      }
    }
  };
  console.log('No se pudieron cargar v4l2 y/o udev');
}

const v4l2 = optionalImports.v4l2;
const udev = optionalImports.udev;
const monitor = udev.monitor();

function setBiggestRGB(camera) {
  var biggestRGB = camera.formats
    .filter((format) => format.formatName === 'RGB3')
    .reduce((acc, format) => format.width * format.height > acc.width * acc.height ? format : acc);
  camera.configSet(biggestRGB);
}

const fakeCamClass = Ember.Object.extend({
  DEVNAME: 'No hay cámara seleccionada',
  ID_V4L_PRODUCT: 'Sin cámara',
  controls: [],
  formats: [{formatName: 'RGB3', width: 1280, height: 720}],
  frames: [],
  currentFrame: 0,

  genFrames: Ember.on('init', function() {
    var frames = this.get('frames');
    var camara = new Image();
    var prohibido = new Image();
    var texto = new Image();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var width = this.configGet().width;
    var height = this.configGet().height;

    var fondoverde;
    var textoycamara;
    var textoycamaratachada;

    var isNotAlpha = (value, index) => (index % 4) !== 3;

    canvas.width = width;
    canvas.height = height;

    camara.src = 'imagenes/camara.png';
    prohibido.src = 'imagenes/prohibido.png';
    texto.src = 'imagenes/advertencia.png';

    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, width, height);
    fondoverde = ctx.getImageData(0, 0, width, height).data.filter(isNotAlpha);
    frames.push(fondoverde);
    frames.push(fondoverde);

    camara.onload = (() => prohibido.onload = (() => texto.onload = () => {
      ctx.drawImage(camara, (width - camara.width) / 2, (height - camara.height) / 2);
      ctx.drawImage(texto, (width - texto.width) / 2, height / 2 + camara.height + 35);

      /* Cada frame es medio segundo, dos segundos de esto */
      textoycamara = ctx.getImageData(0, 0, width, height).data.filter(isNotAlpha);
      frames[0] = textoycamara;
      frames[1] = textoycamara;

      ctx.drawImage(prohibido, (width - prohibido.width) / 2, (height - prohibido.height) / 2);

      /* Y uno de esto */
      textoycamaratachada = ctx.getImageData(0, 0, width, height).data.filter(isNotAlpha);
      frames.push(textoycamaratachada);
      frames.push(textoycamaratachada);
    }));
  }),

  capture(cb) {
    setTimeout(cb, 500);
  },
  configSet() {},
  configGet() {
    return this.get('formats')[0];
  },
  frameRaw() {
    var frames = this.get('frames');
    var frameIdx = this.get('currentFrame');
    this.set('currentFrame', (frameIdx + 1) % frames.length);

    return frames[frameIdx];
  },
  start() {
  },
  stop(cb) {
    cb();
  }
});
const fakeCam = fakeCamClass.create();
const defaultCamera = 0;

export default Ember.Service.extend(Ember.Evented, {
  camaras: Ember.computed(function() {
    var realDevices = udev
      .list('video4linux')
      .filter((dev) => /capture/.test(dev.ID_V4L_CAPABILITIES)) /* Espero que sean dispositivos de captura */
      .sort((a, b) => a.DEVNAME > b.DEVNAME); /* Los ordeno de video0 a videoN */

    /* Si no hay cámaras devuelvo la de prueba */
    if(realDevices.length === 0) {
      return [fakeCam];
    } else {
      return realDevices;
    }
  }),
  cantidadDeCamaras: Ember.computed('camaras', function() {
    return this.get('camaras.length');
  }),
  seleccionada: fakeCam,
  _openDevices: {
    [fakeCam.DEVNAME]: fakeCam
  },
  formatos: Ember.computed.alias('seleccionada.formats'),


  init: Ember.on('init', function() {
    /* Reportar cuando se agrega una cámara */
    monitor.on('add', (dev) => {
      if(dev.SUBSYSTEM === 'video4linux' && /capture/.test(dev.ID_V4L_CAPABILITIES)) {
        /* CREATE CAMERA */
        let camera = {dev: dev};
        let seleccionada = this.get('seleccionada');

        this.trigger('plugged', camera);
        this.notifyPropertyChange('camaras');

        /* Si no había cámaras ahora hay!!!!1111 */
        if(seleccionada === fakeCam) {
          this.seleccionarCamara(defaultCamera);
        }
      }
    });

    /* Reportar cuando se quita una cámara */
    monitor.on('remove', (dev) => {
      if(dev.SUBSYSTEM === 'video4linux' && /capture/.test(dev.ID_V4L_CAPABILITIES)) {
        /* CREATE CAMERA */
        let devices = this.get('_openDevices');
        let device = devices[dev.DEVNAME];
        let camera = {dev: dev, camera: device};
        let seleccionada = this.get('seleccionada');

        this.trigger('unplugged', camera);
        this.notifyPropertyChange('camaras');
        /* CLOSE CAMERA FD */
        // TODO: No hay forma de cerrar el FD con la librería, hay que reparar eso
        devices[dev.DEVNAME] = undefined;

        /* Si saqué la cámara en uso pongo alguna otra */
        if(seleccionada.device === device.device) {
          this.seleccionarCamara(defaultCamera);
        }
      }
    });

    /* Pongo alguna cámara a la vista */
    this.seleccionarCamara(defaultCamera);
  }),

  capturar(camara) {
    var raw = camara.frameRaw();

    if(this.get('seleccionada') !== camara) {
      /* Algo falló, abortemosssssssssssss */
      return;
    }

    this.trigger('frame', raw);
    camara.capture(() => this.capturar(camara));
  },

  /**
   * Permite cambiar la cámara actual.
   *
   * Retorna una promesa porque además de seleccionar la cámara tiene que
   * apagar la cámara anterior, encender la cámara nueva y apuntar todas las
   * propiedades a ese cámara.
   */
  seleccionarCamara(indice) {
    var devname;
    var camara;
    var _openDevices = this.get('_openDevices');

    if (!this.get('camaras')[indice]) {
      throw new Error("No se puede encontrar la cámara índice " + indice);
    }

    devname = this.get('camaras')[indice].DEVNAME;

    if(_openDevices[devname] === undefined) {
      _openDevices[devname] = v4l2.Camera(devname);
    }

    camara = _openDevices[devname];

    try {
      this.get('seleccionada').stop(() => this.cambiarCamara(camara));
    } catch (e) { /* Tal vez dejó de existir la cámara */
      this.cambiarCamara(camara);
    }
  },

  cambiarCamara(camara) {
    this.set('seleccionada', camara);

    setBiggestRGB(camara);
    camara.start();
    camara.capture(() => this.capturar(camara));
  },


  /**
   * Obtener listado de formatos que soporta la cámara seleccionada.
   */
  obtenerFormatos() {

  },

  /**
   * Define el formato a usar por la cámara actual.
   */
  definirFormato(/*indice*/) {

  },


  /**
   * Retorna todos los controles para la cámara actual.
   *
   * El resultado de este método es variable, porque depende del modelo
   * de webcam y de los drivers utilizados. Pero a grandes razgos debería
   * respetar este formato de datos:
   *
   *  [
   *    {
   *      id: 'Contrast',
   *      min: 0,
   *      max: 100,
   *      step: 10,
   *      type: 'int',
   *      menu: []
   *    }
   *  ]
   *
   */
  obtenerControles() {

  },

  /**
   * Retorna el valor de un control en particular.
   */
  obtenerValorDeControl(/*idControl*/) {

  },

  /**
   * Definr el valor de un control en particular.
   */
  definirValorDeControl(/*idControl, valor*/) {

  },

  /**
   * Inicia la captura de uno solo frame.
   *
   * Retorna una promesa que al cumplirse incluye la captura de pantalla
   * en varios formatos, algo así:
   *
   *     {
   *        captura:          base64 en formato png de la captura completa
   *        miniatura:        base64 en formato png de la miniatura
   *        ruta_captura:     path de sistema absoluto a la captura en el disco (solo electron)
   *        ruta_miniatura:   path de sistema absoluto a la miniatura (solo electron)
   *     }
   */
  capturarFrame() {
    let seleccionada = this.get('seleccionada');

    return new Promise((success, reject) => {

      if (seleccionada.camaraReal === false) {
        let capturas = this._obtener_capturas_desde_camara_falsa();

        let nombre_sugerido = this._obtener_numero_aleatorio(100000, 999999);

        // Solo sobre electron intenta guardar las imagenes en archivos:
        if (inElectron) {
          Promise.all([
            this._guardar_base64_en_archivo(capturas.captura, `${nombre_sugerido}.png`),
            this._guardar_base64_en_archivo(capturas.miniatura, `${nombre_sugerido}_miniatura.png`),
          ]).then((resultados) => {
            capturas.ruta_captura = resultados[0];
            capturas.ruta_miniatura = resultados[1];
            success(capturas);
          });
        } else {
          capturas.ruta_captura = null;
          capturas.ruta_miniatura = null;
          success(capturas);
        }

      } else {
        reject("No se implementó la captura sobre una camara real");
      }

    });

  },

  /**
   * Retorna un diccionaro con dos capturas de pantalla desde la cámara falsa.
   *
   * Una captura corresponde a lo que tomó exactamente desde la cámara, y
   * otra captura es la miniatura.
   *
   * Los campos son {captura, miniatura}, las dos en formato base64.
   */
  _obtener_capturas_desde_camara_falsa() {

    var video  = document.getElementById('video'); // TODO: debería conocer el id del elemento a capturar.
    var canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    let captura = canvas.toDataURL('image/png');


    var canvasMiniatura = document.createElement('canvas');
    canvasMiniatura.width  = video.videoWidth / 5;
    canvasMiniatura.height = video.videoHeight / 5;

    var ctxMiniatura = canvasMiniatura.getContext('2d');
    ctxMiniatura.drawImage(video, 0, 0, canvasMiniatura.width, canvasMiniatura.height);
    let capturaMiniatura = canvasMiniatura.toDataURL('image/png');

    return {captura, miniatura: capturaMiniatura};

  },

  /**
   * Genera un archivo en formato .png y lo guarda en el disco.
   *
   * Espera como argumento una imagen en formato base64 de tipo png y el
   * nombre del archivo sugerido (en un path relativo o absoluto).
   *
   * La función retornará la ruta absoluta a la imagen en el sistema.
   */
  _guardar_base64_en_archivo(datos_base_64, nombre_de_archivo) {
    return new Promise((success, reject) => {
      var base64Data = datos_base_64.replace(/^data:image\/png;base64,/, "");
      let path = requireNode('path');

      requireNode("fs").writeFile(nombre_de_archivo, base64Data, 'base64', function(err) {
        if (err) {
          reject(err);
        } else {
          success(path.resolve(nombre_de_archivo));
        }
      });

    });
  },

  /*
   * Retorna un número aleatorio entre dos valores.
   */
  _obtener_numero_aleatorio(min, max) {
    let valor = Math.floor(Math.random() * (max - min) + min);
    return `${valor}`;
  }

});
