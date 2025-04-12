const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
    const rootDir = path.resolve(__dirname, '..');
    const localBackendEnv = path.resolve(__dirname, '.env');
    const envName = process.env.NODE_ENV || 'dev';
  
    const candidates = [
      localBackendEnv,                               // ./backend/.env (pour dev local)
      path.join(rootDir, `.env.${envName}`),         // ../.env.dev, .env.prod, etc.
      path.join(rootDir, `.env`)                     // ../.env (fallback commun)
    ];
  
    for (const envPath of candidates) {
      if (fs.existsSync(envPath)) {
        console.log(`[env] Loaded: ${envPath}`);
        dotenv.config({ path: envPath });
        console.log('[env] Loaded variables:', process.env);
        return;
      }
    }
  
    console.warn('[env] ⚠️ No .env file found in any known location');
  }
  

module.exports = loadEnv;
