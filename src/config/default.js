module.exports = {
  PORT: process.env.PORT || 3000,
  DB_URI: process.env.MONGODB_URI || process.env.DB_URI || null,
  JWT_SECRET: process.env.JWT_SECRET || 'change_this_secret'
};