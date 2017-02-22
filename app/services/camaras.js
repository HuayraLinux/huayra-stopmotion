import Ember from 'ember';
import Translation from '../guvcview_es';
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
const ALTO_THUMBNAIL = 240;

/**
 * Decodea un string en base64 y lo guarda como archivo
 *
 * Espera como argumento un archivo encodeado en base64 y el nombre del archivo
 * sugerido (en un path relativo o absoluto).
 *
 * La función retornará la ruta absoluta a la imagen en el sistema.
 */
function guardar_base64_en_archivo(datos_base_64, ruta_destino, nombre_de_archivo) {
  return new Promise((success, reject) => {
    var base64Data = datos_base_64.replace(/^data:[^,]+,/, "");
    let path = requireNode('path');

    let ruta_completa = path.join(ruta_destino, nombre_de_archivo);

    requireNode("fs").writeFile(ruta_completa, base64Data, 'base64', function(err) {
      if (err) {
        reject(err);
      } else {
        success(path.resolve(ruta_completa));
      }
    });
    /* TODO: Si no estoy en electron puedo crear un blob y usar el localstorage o promptear una descarga */
  });
}

const fakeCamClass = Ember.Object.extend({
  DEVNAME: 'No hay cámara seleccionada',
  ID_V4L_PRODUCT: 'Sin cámara',
  controls: [],
  formats: [{formatName: 'RGB3', width: 1280, height: 720}],
  video: null,

  init: Ember.on('init', function() {
    this.set('video', document.createElement('video')); /* Hay que cambiar esto */
    this.get('video').src = '../lossless.mp4';
    this.get('video').loop = true;
    this.get('video').className = 'canvas-layer';
  })
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


  onInit: Ember.on('init', function() {
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
    return this.seleccionarCamara(defaultCamera);
  }),

  /**
   * Permite cambiar la cámara actual.
   *
   * Retorna una promesa porque además de seleccionar la cámara tiene que
   * apagar la cámara anterior, encender la cámara nueva y apuntar todas las
   * propiedades a ese cámara.
   */
  seleccionarCamara(indice) {
    return new Promise((accept, reject) => {

      if (!this.get('camaras')[indice]) {
        reject(new Error('No se puede encontrar la cámara con índice ' + indice));
      }

      const udevname = this.get('camaras')[indice];
      const devname = udevname.DEVNAME;
      /* Chrome 53 (la versión que está empaquetada ahora) genera los nombres de otra forma,
       * voy a tener que matchear el par vendor-model
       *
       *   URL: https://github.com/HuayraLinux/huayra-stopmotion/issues/17#issuecomment-267340832
       */
      //const chromiumname = `${udevname.ID_V4L_PRODUCT} (${udevname.ID_VENDOR_ID}:${udevname.ID_MODEL_ID})`;
      const vendor_model = /\((....):(....)\)$/;

      /* Si estamos seleccionando la fakeCam saltamos directo ahí */
      if(udevname === fakeCam) {
        this.set('seleccionada', fakeCam);
        return fakeCam.video.play().then(accept);
      }

      /* TODO: Agregar como dato el deviceId de la cámara y pausar el stream anterior */
      return navigator.mediaDevices.enumerateDevices().then((devices) => {
        /* Si no es la cámara fake tengo que frenar el stream para que se pueda pedir la otra */
        if(this.get('seleccionada').video.srcObject) {
          this.get('seleccionada').video.srcObject.getVideoTracks()[0].stop();
        }

        return devices;
      }).then((devices) => {

        /* Esta forma de buscar no funciona en chrome 53, ver el comentario de más arriba */
        //const camara = devices.find((device) => device.label === chromiumname);
        const camara = devices.find((device) => {
          const match = vendor_model.exec(device.label);

          if(match === null) {
            return false;
          }

          const [vendor, model] = match.slice(1);
          return vendor === udevname.ID_VENDOR_ID && model === udevname.ID_MODEL_ID;
        });
        const camaraStream = navigator.mediaDevices.getUserMedia({ video: { deviceId: camara.deviceId, width: 1920, height: 1080 } });

        return camaraStream;
      }).then((camaraStream) => {
        const openDevices = this.get('_openDevices');
        const video = document.createElement('video');

        video.srcObject = camaraStream;
        video.className = 'canvas-layer';

        if(openDevices[devname] === undefined) {
          openDevices[devname] = v4l2.Camera(devname);
        }

        Ember.set(openDevices[devname], 'video', video);

        this.set('seleccionada', openDevices[devname]);

        $(video).on('loadedmetadata', () => {
          /* Si sigue seleccionado */
          if(this.get('seleccionada').video === video) {
            this.notifyPropertyChange('seleccionada'); /* si uso seleccionada.video.videoWidth no anda :\ */
          }
        });

        return video.play();
      }).then(accept, reject).catch(reject);
    });
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
   *      name: 'Contrast',
   *      min: 0,
   *      max: 100,
   *      step: 10,
   *      type: 'int',
   *      menu: []
   *    }
   *  ]
   *
   */
  controls: Ember.computed('seleccionada', function() {
    const camara = this.get('seleccionada');
    const reloadControls = () => {
      camara.reloadControls();
      this.notifyPropertyChange('controls');
    };
    const Control = Ember.Object.extend({
      value: Ember.computed('control.id', 'control.writeOnly', {
        get() {
          const writeOnly = this.get('control.writeOnly');
          const id = this.get('control.id');
          if(writeOnly) {
            return undefined;
          } else {
            return camara.controlGet(id);
          }
        },
        set(key, value) {
          const id = this.get('id');
          /* Si bien hay controles no numéricos con esto debería cubrir todos los casos realistas */
          const newValue = camara.controlSet(id, Number(value)).controlGet(id);
          /* No hay buena forma de saber qué controles cambian, así que vamos a recargarlos todos
           * Dado que es normal que se llamen muchos sets seguidos (si voy a cambiar muchos parámentros)
           * voy a debouncear la llamada al reload.
           */
          Ember.run.debounce(null, reloadControls, 150);

          return newValue;
        }
      }),

      name: Ember.computed('control.name', function() {
          return Translation.$t(this.get('control.name'));
      }),
      menu: Ember.computed('control.menu', function() {
        return this.get('control.menu').map(Translation.$t);
      }),
      disabled: Ember.computed('control.flags.disabled', 'controls.flags.grabbed', 'controls.flags.readOnly', 'controls.flags.inactive', function() {
        const properties = ['control.flags.disabled', 'control.flags.grabbed',
                            'control.flags.readOnly', 'control.flags.inactive'];
        return properties.some((prop) => this.get(prop));
      }),

      unknownProperty(key) {
        const control = this.get('control');
        return Ember.get(control, key);
      }
    });
    return camara.controls
      .filter((control) => !control.flags.readOnly)
      .map((control) => {
        return Control.create({
          control: control
        });
    });
  }),

  /**
   * Inicia la captura de uno solo frame.
   *
   * De manera opcional se puede especificar el directorio en donde se quiera
   * guardar la captura. Cuando se usa normalmente este directorio es el mismo
   * directorio del proyecto.
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
  capturarFrame(ruta_destino) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext("2d");
    ruta_destino = ruta_destino || "./";

    /* TODO: Hacer esto más legible */
    return new Promise((success, reject) => {
      const video = this.get('seleccionada').video;

      var thumbnail = {};
      var framePNG;
      var thumbnailJPEG;
      var now = Date.now();

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0);

      framePNG = canvas.toDataURL('image/png');

      /* Calculo el width del thumbnail (fijo el height a 100px)
       *   Regla de tres simple:
       *     height ------- width
       *     100px  -------   ?
       */
      thumbnail.width = (ALTO_THUMBNAIL * video.videoWidth) / video.videoHeight;
      thumbnail.height = ALTO_THUMBNAIL;

      canvas.width = thumbnail.width;
      canvas.height = thumbnail.height;

      ctx.drawImage(video, 0, 0, thumbnail.width, thumbnail.height);

      thumbnailJPEG = canvas.toDataURL('image/jpeg');

      Promise.all([
        guardar_base64_en_archivo(framePNG, ruta_destino, now + '.png'),
        guardar_base64_en_archivo(thumbnailJPEG, ruta_destino, now + '.thumbnail.jpeg')
      ]).then((archivos) => success({
        captura: framePNG,
        ruta_captura: archivos[0],
        miniatura: thumbnailJPEG,
        ruta_miniatura: archivos[1]
      }), (error) => reject({
        captura: framePNG,
        miniatura: thumbnailJPEG,
        texto: 'Hubo un error',
        error: error
      }));
    });
  }
});
