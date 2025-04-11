require('dotenv').config(); // important pour charger le .env

module.exports = {
  development: {
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'azerty',
    database: process.env.DB_NAME || 'agorium_db_dev',
    host: process.env.DB_HOSTNAME || '127.0.0.1',
    dialect: 'mysql'
  },
  "pre-prod": {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOSTNAME,
    dialect: 'mysql'
  }
};