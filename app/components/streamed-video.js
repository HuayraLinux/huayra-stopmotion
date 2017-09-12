import Ember from 'ember';

const MediaSource = requireNode('mediasource');

/* Nota importante:
 *  Instead of a mime type, an existing MediaSourceStream (as returned by
 *  wrapper.createWriteStream()) can be passed as the single argument to
 *  wrapper.createWriteStream(), which will cause the existing stream to be
 *  replaced by the newly returned stream. This is useful when you want to
 *  cancel the existing stream and replace it with a new one, e.g. when seeking.
 */

export default Ember.Component.extend({
  video: null,

  onNewVideo: Ember.observer('video', function() {
    this.streamVideo();
  }),
  wrappedVideo: null,
  videoSink: null,

  didInsertElement() {
    const video = this.$('video')[0];
    const wrappedVideo = new MediaSource(video);
    const videoSink = wrappedVideo.createWriteStream('video/webm; codecs="vp8"');

    this.set('wrappedVideo', wrappedVideo);
    this.set('videoSink', videoSink);

    video.addEventListener('error', () => {
      // listen for errors on the video/audio element directly
      const errorCode = video.error;
      const detailedError = this.get('wrappedVideo').detailedError;
      console.error('[streamed-video]', errorCode, detailedError);
    });

    this.streamVideo();
  },

  streamVideo() {
    const videoSink = this.get('wrappedVideo').createWriteStream(this.get('videoSink'));
    const videoStream = this.get('video');

    this.set('videoSink', videoSink);

    if(videoStream) {
      /* Y le mando la data */
      videoStream.pipe(videoSink);
    }
  }
});
