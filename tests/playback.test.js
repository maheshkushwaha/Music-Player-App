class PlaybackController {
  constructor() {
    this.currentTrack = null;
    this.isPlaying = false;
    this.queue = [];
  }

  play(track) {
    this.currentTrack = track;
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  skip() {
    const currentIndex = this.queue.indexOf(this.currentTrack);
    const nextTrack = this.queue[currentIndex + 1];
    if (nextTrack) {
      this.play(nextTrack);
    }
  }

  stop() {
    this.currentTrack = null;
    this.isPlaying = false;
  }
}

module.exports = { PlaybackController };