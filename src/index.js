const mongoose = require('mongoose');
const config = require('./config/default');
const app = require('./app');

const PORT = config.PORT || 3000;

async function connectDb() {
  try {
    const uri = config.DB_URI;
    if (!uri) throw new Error('No DB URI provided');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Database connected');
  } catch (err) {
    console.warn('Database connection error:', err.message || err);
    console.warn('Starting server without DB connection (development fallback).');
  }
}

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} already in use. Kill the process or set PORT env variable.`);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
}

(async () => {
  await connectDb();
  startServer();
})();