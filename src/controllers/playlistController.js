let nextId = 1;
const playlists = [];
const favoriteCounts = {
  artist: new Map(),
  album: new Map(),
  song: new Map()
};

function normalizeTrack(track) {
  if (!track) return null;
  return {
    id: track.id ? String(track.id) : String(Date.now()) + Math.random().toString(36).slice(2,8),
    title: track.title || track.trackName || 'Unknown',
    artist: track.artist || track.artistName || 'Unknown',
    album: track.album || track.collectionName || 'Unknown',
    previewUrl: track.previewUrl || null,
    artwork: track.artwork || track.artworkUrl100 || null,
    duration: track.duration || track.trackTimeMillis || 0
  };
}

function createPlaylist(req, res) {
  const { name, tracks = [] } = req.body || {};
  const normalizedTracks = (Array.isArray(tracks) ? tracks : []).map(normalizeTrack).filter(Boolean);
  const playlist = { id: String(nextId++), name: name || `Playlist ${Date.now()}`, tracks: normalizedTracks };
  playlists.push(playlist);
  return res.status(201).json(playlist);
}

function listPlaylists(req, res) {
  return res.json(playlists.map(p => ({ id: p.id, name: p.name, tracksCount: p.tracks.length })));
}

function getPlaylist(req, res) {
  const p = playlists.find(pl => String(pl.id) === String(req.params.id));
  if (!p) return res.status(404).json({ message: 'Playlist not found' });
  return res.json(p);
}

function addTrack(req, res) {
  const p = playlists.find(pl => String(pl.id) === String(req.params.id));
  if (!p) return res.status(404).json({ message: 'Playlist not found' });
  const track = normalizeTrack(req.body.track || req.body);
  if (!track) return res.status(400).json({ message: 'No track provided' });
  p.tracks.push(track);
  return res.status(200).json(p);
}

function removeTrack(req, res) {
  const p = playlists.find(pl => String(pl.id) === String(req.params.id));
  if (!p) return res.status(404).json({ message: 'Playlist not found' });
  const { trackId } = req.body || {};
  if (!trackId) return res.status(400).json({ message: 'trackId required in body' });
  p.tracks = p.tracks.filter(t => String(t.id) !== String(trackId));
  return res.json(p);
}

function markFavorite(req, res) {
  const { type, id } = req.body || {};
  if (!type || !id || !['artist','album','song'].includes(type)) {
    return res.status(400).json({ message: 'Invalid favorite payload' });
  }
  const map = favoriteCounts[type];
  map.set(id, (map.get(id) || 0) + 1);
  return res.json({ message: 'Marked favorite', type, id, count: map.get(id) });
}

function getTrending(req, res) {
  const threshold = parseInt(req.query.threshold || '2', 10);
  const buildList = (map) => Array.from(map.entries())
    .map(([id, count]) => ({ id, count }))
    .filter(i => i.count >= threshold)
    .sort((a,b) => b.count - a.count);
  return res.json({
    artists: buildList(favoriteCounts.artist),
    albums: buildList(favoriteCounts.album),
    songs: buildList(favoriteCounts.song)
  });
}

module.exports = {
  createPlaylist,
  listPlaylists,
  getPlaylist,
  addTrack,
  removeTrack,
  markFavorite,
  getTrending
};