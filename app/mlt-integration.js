import Ember from 'ember';

function promisify(fun) {
   return function(...args) {
     return new Promise((accept, reject) => {
       fun(...args, (err, ...values) => {
         if(values.length === 1) {
           values = values[0];
         }
         if(err) {
           reject(values);
         } else {
           accept(values);
         }
       })
     });
   }
 }

const { spawn } = requireNode('child_process');
const fs = requireNode('fs');
const [ rmdir, symlink, mkdtemp ] = [ promisify(fs.rmdir),
                                      promisify(fs.symlink),
                                      promisify(fs.mkdtemp) ];
const { Promise } = Ember.RSVP;

function generateXML(videoLength, framesPath, fromThumbnails=false) {
  /* Genero el gdx-pixbuf */
  const producer =
    `<producer id="video">
       <property name="resource">${framesPath}/.all.${fromThumbnails? 'png' : 'thumbnail.jpeg'}</property>
       <property name="ttl">1</property>
       <property name="loop">0</property>
       <property name="mlt_service">pixbuf</property>
    </producer>`;
  const playlist = `<entry producer="video" in="0" out="${videoLength}"/>`;
  /* Meto todo en un xml */
  return `<mlt>${producer}<playlist id="main">${playlist}</playlist></mlt>`;
}

/* Devuelve un ReadableStream con la preview */
function preview(pictures, fps=24, onProgress=()=>{}) {
  onProgress(false, {
    stage: 'PREPARATION',
    completed: false
  });

  return setupVideo(pictures).then(framesPath => {
    onProgress(false, {
      stage: 'PREPARATION',
      completed: true
    });

    const encoder = startEncoding(pictures.length, framesPath, fps,
                                  'pipe:1', true, onProgress,
                                  `f=webm vcodec=libvpx acodec=none deadline=realtime`);

    const previewPromise = new Promise((accept, reject) => {
      const video = [];
      encoder.stdout.on('data', chunk => video.push(chunk));
      encoder.on('close', code => {
        if(code === 0) { accept(new Blob(video)); }
        else { reject(encoder); }
      });
    });
    return previewPromise;
  });

  /* TODO: Borrar la carpeta una vez terminado de encodear */
}

function renderVideo(framesPath, fps, path, onProgress=()=>{}) {
  return new Promise((accept, reject) => {
    const readdir = requireNode('fs').readdir;

    /* Veo los archivos de la carpeta */
    readdir(path, (files) => {
      /* Filtro los que me importan y los cuento */
      const length = files.filter((file) => /\.png$/.test(file)).length;
      /* Empiezo a encodear */
      const encoder = startEncoding([0, length], framesPath, fps, path, false, onProgress);
      encoder.on('close', (code) => {
        if(code === 0) { accept(path); }
        else { reject(encoder); }
      });
    });
  });
}

function startEncoding(videoLength, framesPath, fps, path, fromThumbnails=false, onProgress=()=>{}, encoderFlags='properties=/lossless/H.264 vcodec=libx264 acodec=none f=mp4') {
  const xml = generateXML(videoLength, framesPath, fps, fromThumbnails);
  const flags = `-consumer avformat:${path} ${encoderFlags} frame_rate_num=${fps} frame_rate_den=1 -progress`.split(' ');
  const encoder = spawn('melt', [`xml-string:${xml}`].concat(flags));

  encoder.stderr.setEncoding('utf8');
  /* Esto va a necesitar ser retocado, por ahora supongo que me llegan líneas enteras y que no hay errores */
  encoder.stderr.on('data', data => {
    const matchProgress = /Current Frame:[ \t]*([0-9]+), percentage:[ \t]*([0-9]+)/;
    const message = data;
    const match = matchProgress.exec(message) || [];
    const [currentFrame, progress] = match.slice(1);

    onProgress(false, {
      stage: 'ENCODING',
      encoder: encoder,
      encodedFrames: currentFrame,
      percentage: progress
    });
  });
  encoder.on('exit', code => {
    if(code === 0) {
      /* Cerró exitosamente*/
      onProgress(false, {
        stage: 'ENCODING',
        encoder: encoder,
        encodedFrames: videoLength,
        percentage: 100
      });
    } else {
      onProgress({code, encoder}, {
        stage: 'ENCODING',
        encoder: encoder,
        encodedFrames: 0,
        percentage: 0
      });
    }
  })

  return encoder;
}

function setupVideo(pictures) {
  const picturesStrLen = Math.ceil(Math.log10(pictures.length));
  return mkdtemp('/tmp/stopmotion-') /* Hago el directorio temporal */
         .then(tmpPath => {          /* Agrego las fotos */
           const symlinks = pictures.map((picturePath, index) => {
             index++; /* Tengo ganas de que las fotos arranquen en el índice 1 */
             const indexStrLen = Math.ceil(Math.log10(index));
             const paddedIndex = '0'.repeat(picturesStrLen - indexStrLen) + index.toString();
             const [ extension ] = /\.[^.]*$/.exec(picturePath) || [''];
             return symlink(picturePath, `${tmpPath}/${paddedIndex}${extension}`);
           });
           return Promise.all(symlinks).then(() => tmpPath); /* Me importa que ya symlinkie nomás */
         });
}

export { renderVideo, generateXML, preview, startEncoding };
