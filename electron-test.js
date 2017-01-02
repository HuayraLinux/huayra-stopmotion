/* jshint node: true */

var electron = require('electron');

var app = electron.app;
var mainWindow = null;
var BrowserWindow = electron.BrowserWindow;

var fs = require('fs');

const protocol = electron.protocol;
const path = require('path');

app.on('window-all-closed', function onWindowAllClosed() {
  app.quit();
});

//const dirname = __dirname || path.resolve(path.dirname());
//const appLocation = `file://${__dirname}/dist/index.html`;


app.on('ready', function onReady() {

  protocol.registerFileProtocol('app', (request, callback) => {
		let url = request.url.replace('app://', '');

		let filePath = path.join(__dirname, 'dist', url);
		let filePath2 = path.join(__dirname, 'dist', url.replace('assets', ''));

    if (fs.existsSync(filePath)) {
      callback({path: filePath});
    } else {
      callback({path: filePath2});
    }

  }, (error) => {
    if (error) {
			 console.error('Failed to register protocol');
		}
  });

  mainWindow = new BrowserWindow({
    width: 800,
    height: 720,
    minWidth: 700,
    minHeight: 720,
  });

  //mainWindow.toggleDevTools();

  delete mainWindow.module;

  mainWindow.loadURL('file://' + __dirname + '/dist/tests/index.html');

  mainWindow.on('closed', function onClosed() {
    mainWindow = null;
  });

  fs.watchFile(__dirname + '/dist/index.html', function() {
    mainWindow.reload();
  });

});
