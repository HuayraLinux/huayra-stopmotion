import Ember from 'ember';
import { preview } from 'huayra-stopmotion/mlt-integration';

let Captura = Ember.Object.extend({
  href_miniatura: null,       // miniatura cuando se usa electron
  href: null,                 // ruta a la imagen cuando se usa electron
  data_miniatura: null,       // miniatura si NO se usa electron (chrome, firefox, tests ...)
  data: null,                 // imagen cuando NO se usa electro (chrome, firefox, tests ...)
});

function copyOnChange(what, where) {
  return Ember.on('init', Ember.observer(what, function() {
    return this.set(where, this.get(what));
  }));
}

export default Ember.Controller.extend({
  proyecto: Ember.inject.service(),
  camaras: Ember.inject.service(),

  cursor: 0,
  capturas: [],
  intervaloSeleccion: [0, 0],
  capturandoFoto: false,


  copiarCapturas: copyOnChange('capturas', 'cebolla.frames'),
  copiarCursor: copyOnChange('cursor', 'cebolla.cameraFrame'),

  mostrarGrilla: false,
  grilla: {
    filas: 3,
    columnas: 3,
    lineWidth: 1,
    style: 'black',
    dashFormat: []
  },

  mostrarCebolla: false,
  cebolla: {
    frames: [],      /* [ImageSources] from newer to older */
    futureFrames: 0, /* Integer */
    pastFrames: 3,   /* Integer */
    cameraFrame: 0,  /* Integer */
    alpha: 0.2,      /* Float */
  },

  mostrarTimeline: true,
  mostrarConfig: false,

  flipX: false,
  flipY: false,
  writeFlipped: false,
  hasAnyFlip: Ember.computed.or('flipX', 'flipY'),

  pantallaZoom: 1,

  haySeleccion: Ember.computed('intervaloSeleccion', function() {
    let seleccion = this.get('intervaloSeleccion');

    return !(seleccion[0] === 0 && seleccion[1] === 0);
  }),

  modoArrastre: 'insertar',

  previewEncoder: null,
  previewVideo: null,
  previewURL: '',
  previewFailed: false,
  porcentajePreview: 0,
  cargandoPreview: Ember.computed.lt('porcentajePreview', 100),

  timerInterval: 5000,
  timer: null,
  onIntervalChange: Ember.observer('timerInterval', function() {
    const timer = this.get('timer');
    if(timer) {
      this.stopTimer();
      this.startTimer();
    }
  }),

  cambiosSinGuardar: false,
  escucharCambios: Ember.observer('capturas.[]', function() {
    this.set('cambiosSinGuardar', true);
  }),

  teclas: Ember.inject.service(),
  escucharTeclas: Ember.on('init', function() {
    const teclas = this.get('teclas');
    teclas.on('enter',  () => this.send('capturar'));
    teclas.on('izquierda', () => this.send('moverCursor', this.get('cursor') - 1));
    teclas.on('derecha',   () => this.send('moverCursor', this.get('cursor') + 1));
  }),

  aplicar(cambios) {
    cambios.save();
  },

  startTimer() {
    const interval = this.get('timerInterval');

    const runTimer = () => {
      this.send('capturar');
      const timer = Ember.run.later(null, runTimer, interval);
      this.set('timer', timer);
    };

    const newTimer = Ember.run.later(null, runTimer, interval);
    this.set('timer', newTimer);
  },

  stopTimer() {
    const timer = this.get('timer');

    Ember.run.cancel(timer);
    this.set('timer', null);
  },

  flashCaptura() {
    //TODO: Reproducir sonido
    const flash = $('#foto-flash')[0];

    flash.classList.add('flashing');

    flash.addEventListener('animationend', () => flash.classList.remove('flashing'), {once: true});
  },

  actions: {
    seleccionarCamara(indice) {
      this.get('camaras').seleccionarCamara(indice);
    },

    toggleTimer() {
      const timer = this.get('timer');

      if(timer) {
        this.stopTimer();
      } else {
        this.startTimer();
      }
    },

    guardar() {
      let cuadros = this.get("capturas");
      this.get('proyecto').guardarProyectoEnLaRuta(cuadros)
                          .then(() => this.set('cambiosSinGuardar', false));
    },

    toggle: function(id) {
      this.toggleProperty('mostrarConfig');
      $(`#${id}`).sidebar('toggle');
    },

    previsualizar() {
      const seleccion = this.get('intervaloSeleccion');
      const fotos = this.get('capturas')
                        .slice(...seleccion)
                        .map(({href}) => href);
      const videoPromise = preview(fotos, 20, (error, progress) => {
        this.set('previewStatus', progress.status);
        console.info(`[${progress.stage}]`, progress);

        if(progress.stage === 'ENCODING') {
          this.set('previewEncoder', progress.encoder)
          this.set('porcentajePreview', progress.percentage);
        }
      });

      videoPromise.then(video => {
        this.set('previewVideo', video);
        this.set('previewURL', URL.createObjectURL(video));
      }, () => this.set('failedPreview', true));

      /* Open modal */
      Ember.run.schedule('render', null, () => {
        $('.ui.preview.modal').modal('show');
      })
    },

    cerrarPreview() {
      const encoder = this.get('previewEncoder');
      const previewVideo = this.get('previewVideo');
      const previewURL = this.get('previewURL');

      if(encoder) {
        encoder.kill();
      }

      if(previewVideo) {
        this.set('previewURL', URL.revokeObjectURL(previewURL));
      }

      this.set('previewEncoder', null);
      this.set('porcentajePreview', 0);
      this.set('previewVideo', null);
      this.set('previewFailed', false);
    },

    eliminarCuadrosSeleccionados() {
      let a = this.get('intervaloSeleccion')[0];
      let b = this.get('intervaloSeleccion')[1];

      let primer_parte = this.get('capturas').slice(0, a);
      let segunda_parte = this.get('capturas').slice(b);

      this.set('capturas', primer_parte.concat(segunda_parte));

      this.set('intervaloSeleccion', [0, 0]);
    },

    capturar() {
      const writeFlipped = this.get('writeFlipped');
      const flipx = writeFlipped && this.get('flipX');
      const flipy = writeFlipped && this.get('flipY');

      this.flashCaptura();

      this.set('capturandoFoto', true);

      this.get('camaras').capturarFrame(this.get('model.ubicacion'), flipx, flipy).then((fotos) => {
        this.set('capturandoFoto', false);
        let data = {};

        if (inElectron) {
          data.href_miniatura = fotos.ruta_miniatura;
          data.href = fotos.ruta_captura;
        } else {
          data.data_miniatura = fotos.miniatura;
          data.data = fotos.captura;
        }

        const cursor = this.get('cursor');

        this.get('capturas').splice(cursor, 0, Captura.create(data));
        this.get('capturas').arrayContentDidChange(cursor, 0, 1);

        this.set('cursor', this.get('cursor') + 1);

      }, (error) => {
        this.set('capturandoFoto', false);
        console.error(error);
        alert(error);
      });
    },

    moverCuadros(desde, hasta, cantidad=1) {
       const capturas =  this.get('capturas');
       /* Quito la captura que draggié */
       const dragged = capturas.splice(desde, cantidad);
       const cursor = this.get('cursor');

       capturas.splice(hasta, 0, ...dragged);

       if(desde > cursor && hasta < cursor) {
          this.set('cursor', cursor + 1);
        } else if(desde < cursor && hasta > cursor) {
          this.set('cursor', cursor - 1);
        }

        capturas.arrayContentDidChange(Math.min(desde, hasta));

       return capturas;
    },

    moverCursor(hasta) {
      this.set('cursor', hasta);
    }
  }
});
