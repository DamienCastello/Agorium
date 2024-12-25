const multer = require('multer');

function createUploader(folder, limits = { fieldSize: 25 * 1024 * 1024 }) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `uploads/${folder}/`);
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  });

  return multer({ storage, limits });
}

// Configure uploaders with specific or default limit
const avatarUploader = createUploader('avatars', { fileSize: 5 * 1024 * 1024 }); // specific limit : 5 MB
const previewUploader = createUploader('previews'); // default limit : 25 MB

module.exports = { avatarUploader, previewUploader };
