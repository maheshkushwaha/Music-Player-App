module.exports = (app) => {
  try {
    const api = require('./api');
    api(app);
  } catch (e) {
    console.error('Failed to mount /api routes:', e);
  }

  app.get('/', (req, res) => {
    res.sendFile(require('path').join(__dirname, '..', '..', 'public', 'index.html'));
  });
};