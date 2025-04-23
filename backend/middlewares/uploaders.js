const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

function createUploader(folder, limits = { fileSize: 25 * 1024 * 1024 }) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/uploads', folder));
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      
      //stocker le chemin relatif dans l'objet req pour le contrôleur
      if (!req.uploadedFiles) req.uploadedFiles = {};
      req.uploadedFiles[folder] = `uploads/${folder}/${filename}`;

      cb(null, filename);
    }
  });

  return multer({ storage, limits });
}

const avatarUploader = createUploader('avatars', { fileSize: 5 * 1024 * 1024 });
const previewUploader = createUploader('previews');

module.exports = { avatarUploader, previewUploader };
