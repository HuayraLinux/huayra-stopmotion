var config = require('./package.json');

if (config.livereload) {
    var Gaze = require('gaze').Gaze;
    var gaze = new Gaze('**/*');
    var doReload = false;

    setInterval(function() {

        if (doReload) {
            window.location.reload();
            doReload = false;
        }

    }, 2000);

    gaze.on('all', function(event, filepath) {
        if (location)
            doReload = true;
    });
}