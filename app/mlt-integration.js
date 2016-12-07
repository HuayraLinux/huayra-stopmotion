import Ember from 'ember';

const spawn = requireNode('child_process').spawn;
const Promise = Ember.RSVP.Promise;

function generateXML(frames, fpsStopmotion, fpsResult, fromThumbnails=false) {
  /* El factor de conversión entre una captura de stopmotion y un frame del video */
  const factorConversion = fpsResult / fpsStopmotion;
  /* Saco las rutas de las fotos */
  const files = frames.map((frame) => fromThumbnails ? frame.href_miniatura : frame.href);
  /* Genero la lista de Producers (objetos que generan imágenes) */
  const producers = files.map((src) => `<producer id="frame_${src}"><property name="resource">${src}</property></producer>`).join('');
  /* Genero la playlist */
  const playlist = files.map((src, idx) => `<entry producer="frame_${src}" in="${idx * factorConversion}" out="${idx * factorConversion + factorConversion - 1}"/>`).join('');
  /* Meto todo en un xml */
  return `<mlt>${producers}<playlist id="main">${playlist}</playlist></mlt>`;
}

function execPreview(frames, fps, fromThumbnails=false, onProgress=()=>{}) {
  return new Promise((accept, reject) => {
    /* Voy a suponer que el output es de 60 frames */
    const xml = generateXML(frames, fps, 60, fromThumbnails);
    const preview = spawn('melt', [`xml-string:${xml}`]);

    /* Esto va a necesitar ser retocado, por ahora supongo que me llegan líneas enteras y que no ahy errores */
    preview.stderr.on('data', (data) => {
      const matchProgress = /Current Frame:[ \t]*([0-9]+), percentage:[ \t]*([0-9]+)/;
      const message = data.toString();
      const [currentFrame, progress] = matchProgress.exec(message).slice(1);

      onProgress(currentFrame, progress);
    });

    preview.on('close', (code) => {
      if(code === 0) { accept(); }
      else { reject(); }
    });
  });
}

function generateVideo(frames, fps, path, fromThumbnails=false) {
  return new Promise((accept, reject) => {
    /* Depende del formato del video, vamos a suponer 30 POR AHORA */
    const xml = generateXML(frames, fps, 30, fromThumbnails);
    const videoGeneration = spawn('melt', [`xml-string:${xml}`, '-consumer', 'avformat:${path}', 'vcodec:libx264', 'preset=ultrafast']);

    videoGeneration.on('close', (code) => {
      if(code === 0) { accept(path); }
      else { reject(); }
    });
  });
}

export {generateVideo, generateXML, execPreview};