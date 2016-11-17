/**
 * Script de prueba para generar un XML de mltframework
 *
 *  Documentación:
 *    - https://www.mltframework.org/docs/mltxml/
 */
files = require('fs').readdirSync('.').filter((a) => /.png$/.test(a));
producers = files.map((src) => `\t<producer id="frame_${src}"><property name="resource">${src}</property></producer>`).join('\n');
playlist = files.map((src, idx) => `\t\t<entry producer="frame_${src}" in="${idx}" out="${idx}"/>`).join('\n');
xml = `<mlt>
${producers}
	<playlist id="main">
${playlist}
	</playlist>
</mlt>`;

console.log(xml);
