'use strict';

var exec = require('child_process').exec;

var Ffmpeg = function(opts) {
  this._src = opts.source;
  this._options = [];
};
Ffmpeg.prototype.withVideoCodec = function(codec) {
  this._codec = codec;
  return this;
};
Ffmpeg.prototype.withFps = function(fps) {
  this._fps = fps;
  return this;
};
Ffmpeg.prototype.withVideoBitrate = function(bitRate) {
  this._bitRate = bitRate;
  return this;
};
Ffmpeg.prototype.withAspect = function(aspect) {
  this._aspect = aspect;
  return this;
};
Ffmpeg.prototype.withSize = function(size) {
  this._size = size;
  return this;
};
Ffmpeg.prototype.addOptions = function(optionsArr) {
  this._options = this._options.concat(optionsArr.map(function(anOption) {
    return anOption.split(' ');
  }).reduce(function(total, chunks) {
    return total.concat(chunks);
  }, []));
  return this;
};
Ffmpeg.prototype.onProgress = function(progressCallback) {
  // do nothing...
  return this;
};
Ffmpeg.prototype.saveToFile = function(fileName, callback) {
  var options = [];
  options = options.concat(['-f', 'image2']);
  if(this._fps) {
    options = options.concat(['-r', this._fps]);
  }
  options = options.concat(['-i', this._src]);
  if(this._bitRate) {
    options = options.concat(['-b', this._bitRate]);
  }
  if(this._codec) {
    options = options.concat(['-vcodec', this._codec]);
  }
  if(this._aspect) {
    options = options.concat(['-aspect', this._aspect]);
  }
  options = options.concat(this._options);
  if(this._size) {
    options = options.concat(['-s', this._size]);
  }
  options = options.concat(['-y', fileName]);

  exec('avconv ' + options.join(' '), function(err, stdout, stderr) {
    callback(stdout, stderr, err);
  });

  console.log('avconv ' + options.join(' '));

  return this;
};

module.exports = Ffmpeg;