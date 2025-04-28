const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { getUploadPath } = require('../utils/getUploadPath');

function createUploader(folder, limits = { fileSize: 25 * 1024 * 1024 }) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, getUploadPath(folder).fullPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      if (!req.uploadedFiles) req.uploadedFiles = {};
      req.uploadedFiles[folder] = `uploads/${folder}/${filename}`;
      cb(null, filename);
    }
  });

  return multer({ storage, limits });
}

const avatarUploader = createUploader('avatars', { fileSize: 5 * 1024 * 1024 });

module.exports = { avatarUploader };
