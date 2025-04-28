const fs = require('fs');
const path = require('path');

function getUploadPath(folder, filename = '') {
  const isDev = process.env.NODE_ENV === 'development';

  const basePath = isDev
    ? path.join(__dirname, '..', 'uploads', folder)
    : path.join(__dirname, '..', 'public', 'uploads', folder);

  // Crée le dossier en dev uniquement
  if (isDev && !fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
    console.log(`🗂️ Dossier créé : ${basePath}`);
  }

  const fullPath = path.join(basePath, filename);
  const dbPath = `uploads/${folder}/${filename}`;

  return { fullPath, dbPath };
}

module.exports = { getUploadPath };