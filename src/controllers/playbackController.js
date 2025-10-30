class PlaybackController {
  constructor() {
    this.queue = [];
    this.currentTrack = null;
    this.isPlaying = false;
  }

  play(track) {
    if (track) {
      this.currentTrack = track;
      if (!this.queue.find(t => t.id === track.id)) this.queue.unshift(track);
    } else if (!this.currentTrack && this.queue.length) {
      this.currentTrack = this.queue[0];
    }
    this.isPlaying = true;
  }

  pause() {
    this.isPlaying = false;
  }

  stop() {
    this.isPlaying = false;
    this.currentTrack = null;
  }

  skip() {
    if (!this.queue.length) return;
    const idx = this.queue.findIndex(t => t.id === (this.currentTrack && this.currentTrack.id));
    const next = (idx === -1) ? this.queue[1] : this.queue[idx + 1];
    this.currentTrack = next || this.queue[0];
    this.isPlaying = !!this.currentTrack;
  }
}

module.exports = { PlaybackController };