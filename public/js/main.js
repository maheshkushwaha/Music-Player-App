const musicList = document.getElementById('music-list');
const refreshBtn = document.getElementById('refresh-music');
const playlistsList = document.getElementById('playlists-list');
const createPlaylistForm = document.getElementById('create-playlist-form');
const playlistNameInput = document.getElementById('playlist-name');
const markFavBtn = document.getElementById('mark-fav');
const favType = document.getElementById('fav-type');
const favId = document.getElementById('fav-id');
const loadTrendingBtn = document.getElementById('load-trending');
const trendingOut = document.getElementById('trending-output');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

const playerArtwork = document.getElementById('player-artwork');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerPlay = document.getElementById('player-play');
const playerPrev = document.getElementById('player-prev');
const playerNext = document.getElementById('player-next');
const playerProgress = document.getElementById('player-progress');
const playerCurrent = document.getElementById('player-current');
const playerDuration = document.getElementById('player-duration');

let audio = new Audio();
let currentTrack = null;
let lastMusicList = [];
let currentIndex = -1;
let isPlaying = false;

function formatTime(value){
  if (value == null) return '0:00';
  let seconds = 0;
  if (value > 1000) seconds = Math.floor(value/1000);
  else seconds = Math.floor(value);
  const m = Math.floor(seconds/60);
  const s = String(seconds % 60).padStart(2,'0');
  return `${m}:${s}`;
}

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body && body.message ? body.message : `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return body;
}

function setPlayerTrack(t, list = [], idx = -1) {
  currentTrack = t;
  lastMusicList = list || [];
  currentIndex = idx;
  playerArtwork.src = t.artwork || '/css/placeholder.png';
  playerTitle.textContent = t.title || 'Unknown';
  playerArtist.textContent = t.artist || 'Unknown';
  playerDuration.textContent = t.duration ? formatTime(t.duration) : '0:30';
  audio.src = t.previewUrl || '';
  audio.load();
  playAudio();
}

async function playAudio() {
  if (!audio.src) return;
  try {
    await audio.play();
    isPlaying = true;
    playerPlay.textContent = '⏸';
  } catch (err) {
    console.warn('Play blocked', err);
  }
}

function pauseAudio() {
  audio.pause();
}

playerPlay.addEventListener('click', async () => {
  if (!currentTrack) return;
  if (isPlaying) pauseAudio(); else try { await playAudio(); } catch(e) {}
});
playerPrev.addEventListener('click', () => {
  if (currentIndex > 0) setPlayerTrack(lastMusicList[currentIndex - 1], lastMusicList, currentIndex - 1);
});
playerNext.addEventListener('click', () => {
  if (currentIndex + 1 < lastMusicList.length) setPlayerTrack(lastMusicList[currentIndex + 1], lastMusicList, currentIndex + 1);
});

audio.onloadedmetadata = () => {
  const dur = audio.duration;
  if (dur && !isNaN(dur)) playerDuration.textContent = formatTime(dur);
};

audio.onplay = () => {
  isPlaying = true;
  playerPlay.textContent = '⏸';
  const activeId = currentTrack && currentTrack.id ? String(currentTrack.id) : null;
  document.querySelectorAll('.play-btn, .playlist-play-btn').forEach(b => {
    if (b.dataset.id && activeId && String(b.dataset.id) === activeId) b.textContent = 'Pause';
    else b.textContent = 'Play';
  });
};

audio.onpause = () => {
  isPlaying = false;
  playerPlay.textContent = '▶️';
  document.querySelectorAll('.play-btn, .playlist-play-btn').forEach(b => b.textContent = 'Play');
};

audio.onended = () => {
  isPlaying = false;
  playerPlay.textContent = '▶️';
  document.querySelectorAll('.play-btn, .playlist-play-btn').forEach(b => b.textContent = 'Play');
  if (currentIndex + 1 < lastMusicList.length) setPlayerTrack(lastMusicList[currentIndex + 1], lastMusicList, currentIndex + 1);
};

audio.ontimeupdate = () => {
  const dur = audio.duration || (currentTrack && currentTrack.duration && currentTrack.duration > 1000 ? (currentTrack.duration/1000) : 30);
  const cur = audio.currentTime || 0;
  const pct = Math.min(100, Math.floor((cur / dur) * 100));
  playerProgress.value = pct;
  playerCurrent.textContent = `${Math.floor(cur/60)}:${String(Math.floor(cur%60)).padStart(2,'0')}`;
};

playerProgress.addEventListener('input', () => {
  const dur = audio.duration || (currentTrack && currentTrack.duration && currentTrack.duration > 1000 ? (currentTrack.duration/1000) : 30);
  const pct = Number(playerProgress.value);
  audio.currentTime = (pct/100) * dur;
});

async function loadMusic(query) {
  try {
    const q = query || '';
    const url = q ? `/api/music?q=${encodeURIComponent(q)}` : '/api/music';
    const data = await fetchJSON(url);
    lastMusicList = data;
    musicList.innerHTML = '';
    data.forEach((t, i) => {
      const li = document.createElement('li');
      const left = document.createElement('div');
      left.className = 'left';
      const img = document.createElement('img');
      img.src = t.artwork || '/css/placeholder.png';
      img.width = 64; img.height = 64;
      const meta = document.createElement('div');
      meta.innerHTML = `<strong style="display:block">${t.title}</strong><small class="muted">${t.artist} — ${t.album || ''}</small>`;
      left.appendChild(img); left.appendChild(meta);

      const controls = document.createElement('div');
      const playBtn = document.createElement('button');
      playBtn.className = 'play-btn';
      playBtn.dataset.id = t.id;
      playBtn.textContent = 'Play';
      playBtn.onclick = () => {
        if (!t.previewUrl) return alert('Preview not available for this track');
        setPlayerTrack(t, data, i);
      };

      const addBtn = document.createElement('button');
      addBtn.className = 'add-btn secondary';
      addBtn.textContent = 'Add';
      addBtn.onclick = () => addToFirstPlaylist(t);

      controls.appendChild(playBtn); controls.appendChild(addBtn);
      li.appendChild(left); li.appendChild(controls);
      musicList.appendChild(li);
    });
  } catch (err) {
    musicList.innerHTML = `<li>Error loading music: ${err.message}</li>`;
  }
}

async function loadPlaylists() {
  try {
    const data = await fetchJSON('/api/playlists');
    playlistsList.innerHTML = '';
    data.forEach(p => {
      const li = document.createElement('li');
      li.style.display = 'flex'; li.style.justifyContent = 'space-between'; li.style.alignItems = 'center';
      li.dataset.id = p.id;
      const left = document.createElement('div');
      left.textContent = `${p.name} (${p.tracksCount != null ? p.tracksCount : 0})`;
      left.style.cursor = 'pointer';
      left.onclick = () => showPlaylist(p.id);
      const viewBtn = document.createElement('button');
      viewBtn.textContent = 'Open';
      viewBtn.onclick = (e) => { e.stopPropagation(); showPlaylist(p.id); };
      li.appendChild(left); li.appendChild(viewBtn);
      playlistsList.appendChild(li);
    });
  } catch (err) {
    playlistsList.innerHTML = `<li>Error loading playlists: ${err.message}</li>`;
  }
}

async function showPlaylist(id) {
  try {
    const p = await fetchJSON(`/api/playlists/${id}`);
    const detailRoot = document.getElementById('playlist-detail-panel');
    detailRoot.innerHTML = `<h3>${p.name}</h3><small class="muted">${p.tracks.length} tracks</small>`;
    if (!p.tracks.length) { detailRoot.innerHTML += '<p class="muted">No tracks in this playlist.</p>'; return; }
    const ul = document.createElement('ul'); ul.style.listStyle='none'; ul.style.padding='0'; ul.style.marginTop='8px';
    p.tracks.forEach((t, idx) => {
      const li = document.createElement('li');
      li.style.display='flex'; li.style.justifyContent='space-between'; li.style.alignItems='center'; li.style.padding='8px 0';
      const info = document.createElement('div'); info.innerHTML = `<strong>${t.title}</strong><br><small class="muted">${t.artist} — ${t.album}</small>`;
      const controls = document.createElement('div');
      const playBtn = document.createElement('button');
      playBtn.className = 'playlist-play-btn';
      playBtn.dataset.id = t.id;
      playBtn.textContent = 'Play';
      playBtn.onclick = () => setPlayerTrack(t, p.tracks, idx);
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove'; removeBtn.className = 'secondary';
      removeBtn.onclick = async () => {
        try {
          await fetchJSON(`/api/playlists/${id}/tracks`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ trackId: t.id })
          });
          await showPlaylist(id); await loadPlaylists();
        } catch (err) { alert('Error removing track: ' + err.message); }
      };
      controls.appendChild(playBtn); controls.appendChild(removeBtn);
      li.appendChild(info); li.appendChild(controls); ul.appendChild(li);
    });
    detailRoot.appendChild(ul);
  } catch (err) { alert('Error loading playlist: ' + err.message); }
}

async function addToFirstPlaylist(track) {
  try {
    const pls = await fetchJSON('/api/playlists');
    if (!pls.length) { alert('No playlists — create one first.'); return; }
    const id = pls[0].id;
    await fetchJSON(`/api/playlists/${id}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ track })
    });
    await loadPlaylists(); await showPlaylist(id);
  } catch (err) { alert('Error adding to playlist: ' + err.message); }
}

createPlaylistForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = playlistNameInput.value.trim(); if (!name) return;
  try {
    const created = await fetchJSON('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    playlistNameInput.value = '';
    await loadPlaylists(); showPlaylist(created.id);
  } catch (err) { alert('Error creating playlist: ' + err.message); }
});

markFavBtn.addEventListener('click', async () => {
  const type = favType.value; const id = favId.value.trim(); if (!id) return alert('Enter an id to mark');
  try {
    const res = await fetchJSON('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, id })
    });
    alert(`Marked favorite: ${JSON.stringify(res)}`);
  } catch (err) { alert('Error marking favorite: ' + err.message); }
});

loadTrendingBtn.addEventListener('click', async () => {
  try { const res = await fetchJSON('/api/trending'); trendingOut.textContent = JSON.stringify(res, null, 2); }
  catch (err) { trendingOut.textContent = 'Error: ' + err.message; }
});

refreshBtn.addEventListener('click', () => loadMusic());
searchBtn.addEventListener('click', () => loadMusic(searchInput.value.trim()));
searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') loadMusic(searchInput.value.trim()); });

document.addEventListener('DOMContentLoaded', () => {
  loadMusic(); loadPlaylists();
});