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
        return []; /* No hay cámaras */
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
const ALTO_THUMBNAIL = 80;

function setBiggestRGB(camera) {
  var biggestRGB = camera.formats
    .filter((format) => format.formatName === 'RGB3')
    .reduce((acc, format) => format.width * format.height > acc.width * acc.height ? format : acc);
  camera.configSet(biggestRGB);
}

function rgb2rgba(rgb, rgba) {
  var length = rgb.length / 3; /* RGB son 3 bytes por pixel */

  for(var i = 0; i < length; i++) {
    rgba[i * 4 + 0] = rgb[i * 3 + 0]; /* Rojo  */
    rgba[i * 4 + 1] = rgb[i * 3 + 1]; /* Verde */
    rgba[i * 4 + 2] = rgb[i * 3 + 2]; /* Azul  */
    rgba[i * 4 + 3] = 255; /* Alpha: la imagen es opaca */
  }

  return rgba;
}

/**
 * Decodea un string en base64 y lo guarda como archivo
 *
 * Espera como argumento un archivo encodeado en base64 y el nombre del archivo
 * sugerido (en un path relativo o absoluto).
 *
 * La función retornará la ruta absoluta a la imagen en el sistema.
 */
function guardar_base64_en_archivo(datos_base_64, nombre_de_archivo) {
  return new Promise((success, reject) => {
    var base64Data = datos_base_64.replace(/^data:[^,]+,/, "");
    let path = requireNode('path');

    requireNode("fs").writeFile(nombre_de_archivo, base64Data, 'base64', function(err) {
      if (err) {
        reject(err);
      } else {
        success(path.resolve(nombre_de_archivo));
      }
    });

  });
}

const fakeCamClass = Ember.Object.extend({
  DEVNAME: 'No hay cámara seleccionada',
  ID_V4L_PRODUCT: 'Sin cámara',
  controls: [],
  formats: [{formatName: 'RGB3', width: 1280, height: 720}],
  frames: [],
  currentFrame: 0,

  /**
   *Actualmente el servicio nunca usa más de una llamada a captura por frame
   * en esta imitación tomamos eso como requerimiento
   */
  timeout: undefined,

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
      ctx.drawImage(texto, (width - texto.width) / 2, height / 2 - camara.height - texto.height - 20);

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
    var timeout = setTimeout(cb, 500);

    this.set('timeout', timeout);
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
  start() {},
  stop(cb) {
    clearTimeout(this.get('timeout'));
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
  formato: Ember.computed('seleccionada', function() {
    return this.get('seleccionada').configGet();
  }),


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
        /* TODO: No hay forma de cerrar el FD con la librería, hay que reparar eso */
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

    /* Espero a que sea mi turno para decirle a todo el mundo que dibuje */
    window.requestAnimationFrame(() => {
      this.trigger('frame', raw);
      camara.capture(() => this.capturar(camara));
    });
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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");

    /* TODO: Hacer esto más legible */
    return new Promise((success, reject) => this.one('frame', (raw) => {
      var formato = this.get('formato');
      var frame = ctx.createImageData(formato.width, formato.height);
      var thumbnail = {};
      var framePNG;
      var thumbnailPNG;
      var now = Date.now();

      rgb2rgba(raw, frame.data);

      canvas.width = formato.width;
      canvas.height = formato.height;

      ctx.putImageData(frame, 0, 0, 0, 0, canvas.width, canvas.height);

      framePNG = canvas.toDataURL('image/png');

      /* Calculo el width del thumbnail (fijo el height a 100px)
       *   Regla de tres simple:
       *     height ------- width
       *     100px  -------   ?
       */
      thumbnail.width = (ALTO_THUMBNAIL * formato.width) / formato.height;
      thumbnail.height = ALTO_THUMBNAIL;

      ctx.drawImage(canvas, 0, 0, thumbnail.width, thumbnail.height);
      thumbnail.imageData = ctx.getImageData(0, 0, thumbnail.width, thumbnail.height);

      canvas.width = thumbnail.width;
      canvas.height = thumbnail.height;

      ctx.putImageData(thumbnail.imageData, 0, 0);

      thumbnailPNG = canvas.toDataURL('image/png');

      Promise.all([
        guardar_base64_en_archivo(framePNG, now + '.png'),
        guardar_base64_en_archivo(thumbnailPNG, now + '.thumbnail.png')
      ]).then((archivos) => success({
        captura: framePNG,
        ruta_captura: archivos[0],
        miniatura: thumbnailPNG,
        ruta_miniatura: archivos[1]
      }), (error) => reject({
        texto: 'Hubo un error',
        error: error
      }));
    }));
  }
});
