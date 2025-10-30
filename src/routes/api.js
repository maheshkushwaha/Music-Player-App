const express = require('express');
const https = require('https');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

function fetchITunes(term = 'top hits', limit = 20) {
  const qs = `term=${encodeURIComponent(term)}&entity=song&limit=${limit}`;
  const url = `https://itunes.apple.com/search?${qs}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.results || []);
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.get('/music', async (req, res) => {
  try {
    const q = req.query.q || 'top hits';
    const limit = parseInt(req.query.limit || '20', 10);
    const results = await fetchITunes(q, limit);
    const mapped = results.map(r => ({
      id: r.trackId || `${r.collectionId}-${r.trackName}`,
      title: r.trackName,
      artist: r.artistName,
      album: r.collectionName,
      duration: r.trackTimeMillis,
      previewUrl: r.previewUrl,
      artwork: r.artworkUrl100,
      genre: r.primaryGenreName
    }));
    res.json(mapped);
  } catch (err) {
    console.error('iTunes fetch error', err);
    res.status(500).json({ message: 'Failed to fetch music' });
  }
});

router.get('/playlists', playlistController.listPlaylists);
router.post('/playlists', playlistController.createPlaylist);
router.get('/playlists/:id', playlistController.getPlaylist);
router.post('/playlists/:id/tracks', playlistController.addTrack);
router.delete('/playlists/:id/tracks', playlistController.removeTrack);

router.post('/favorites', playlistController.markFavorite);
router.get('/trending', playlistController.getTrending);

module.exports = (app) => {
  app.use('/api', router);
};