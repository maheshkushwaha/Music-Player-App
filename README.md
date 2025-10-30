# Music Player — Demo App

Simple Node + Express API with a static frontend (iTunes preview). Play, create playlists, mark favorites. Playlists are stored in-memory by default (no DB required).

## Features
- Browse real music from the iTunes Search API (/api/music?q=...)
- Create / view / modify playlists
- Preview 30s audio snippets
- Basic trending/favorites endpoints
- Responsive, modern frontend in `public/`

## Prerequisites
- Node.js 18+ and npm
- Optional: MongoDB if you want persistent storage (set `MONGODB_URI`)

## Quick Start (Windows)
1. Open a terminal and install deps:
```powershell
cd /d D:\CodingNinja\music-player-1
npm install
```
2. Start the app:
```powershell
npm start
# or for development with auto-reload (if nodemon installed)
npm run dev
```
3. Open http://localhost:3000

To use a different port:
```powershell
$env:PORT=3001; npm start
```
To provide a MongoDB URI:
```powershell
$env:MONGODB_URI="mongodb://user:pass@host:27017/music-player"; npm start
```

## API (important endpoints)
- GET /api/music?q=SEARCH — search iTunes (no key)
- GET /api/playlists — list playlists
- POST /api/playlists — create playlist { name, tracks? }
- GET /api/playlists/:id — playlist detail
- POST /api/playlists/:id/tracks — add track { track }
- DELETE /api/playlists/:id/tracks — remove track { trackId }
- POST /api/favorites — mark favorite { type: song|album|artist, id }
- GET /api/trending — trending items

Frontend files are in `public/` (index.html, css, js).

## Tests
Run unit tests:
```powershell
npm test
# or
npx jest --runInBand
```

## Troubleshooting
- Error "Cannot find module 'mongoose'": run `npm install` or `npm install mongoose`.
- DB connection fails: either start local MongoDB or omit `MONGODB_URI` to use in-memory fallback.
- Port 3000 in use:
```powershell
netstat -ano | findstr :3000
taskkill /PID <pid> /F
# or
npx kill-port 3000
```

## Deployment
- Frontend-only (static): use GitHub Pages / Netlify / Vercel serving the `public/` folder.
- Full app (server + API): deploy to Render, Railway, Heroku, or a VPS. Set `MONGODB_URI` and `PORT` in the host environment and use `npm start` as the start command.

## Notes
- Playlists are stored in-memory (server restart clears them). Replace controllers with a DB-backed implementation for persistence.
- iTunes previews are subject to Apple terms.

License: MIT