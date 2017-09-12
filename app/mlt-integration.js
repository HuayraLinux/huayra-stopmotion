import Ember from 'ember';

/*
 * NOTA IMPORTANTE:
 *   Todo el contenido de este archivo es válido sólo si las fotos están en orden
 *   dentro de la carpeta dada.
 */

const spawn = requireNode('child_process').spawn;
const Promise = Ember.RSVP.Promise;

function generateXML(seleccion, framesPath, fromThumbnails=false) {
  /* Genero el gdx-pixbuf */
  const producer =
    `<producer id="video">
       <property name="resource">${framesPath}/.all.${fromThumbnails? 'png' : 'thumbnail.jpeg'}</property>
       <property name="ttl">1</property>
       <property name="loop">0</property>
       <property name="mlt_service">pixbuf</property>
    </producer>`;
  /* Genero la playlist, seleccion[1] no se incluye, por lo que tengo que recortarlo */
  const playlist = `<entry producer="video" in="${seleccion[0]}" out="${seleccion[1] - 1}"/>`;
  /* Meto todo en un xml */
  return `<mlt>${producer}<playlist id="main">${playlist}</playlist></mlt>`;
}

/* Devuelve un ReadableStream con la preview */
function preview(seleccion, framesPath='.', fps=24, onProgress=()=>{}) {
  return startEncoding(seleccion, framesPath, fps, 'pipe:1', true, onProgress,
                       `f=webm vcodec=libvpx acodec=none deadline=realtime`).stdout;
}

function renderVideo(framesPath, fps, path, onProgress=()=>{}) {
  return new Promise((accept, reject) => {
    const readdir = requireNode('fs').readdir;

    /* Veo los archivos de la carpeta */
    readdir(path, (files) => {
      /* Filtro los que me importan y los cuento */
      const length = files.filter((file) => /\.png$/.test(file)).length;
      /* Empiezo a encodear */
      const encodingProcess = startEncoding([0, length], framesPath, fps, path, false, onProgress);
      encodingProcess.on('close', (code) => {
        if(code === 0) { accept(path); }
        else { reject(encodingProcess); }
      });
    });
  });
}

function startEncoding(seleccion, framesPath, fps, path, fromThumbnails=false, onProgress=()=>{}, encoderFlags='properties=/lossless/H.264 vcodec=libx264 acodec=none f=mp4') {
  const xml = generateXML(seleccion, framesPath, fps, fromThumbnails);
  const flags = `-consumer avformat:${path} ${encoderFlags} frame_rate_num=${fps} frame_rate_den=1 -progress`.split(' ');
  const encoder = spawn('melt', [`xml-string:${xml}`].concat(flags));

  encoder.stderr.setEncoding('utf8');
  /* Esto va a necesitar ser retocado, por ahora supongo que me llegan líneas enteras y que no hay errores */
  encoder.stderr.on('data', (data) => {
    const matchProgress = /Current Frame:[ \t]*([0-9]+), percentage:[ \t]*([0-9]+)/;
    const message = data;
    const match = matchProgress.exec(message) || [];
    const [currentFrame, progress] = match.slice(1);

    onProgress(currentFrame, progress);
  });

  return encoder;
}

export { renderVideo, generateXML, preview, startEncoding };
