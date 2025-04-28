const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { getUploadPath } = require('../utils/getUploadPath');

const articleUploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const folder = file.fieldname === 'preview' ? 'previews' : 'videos';
      const { fullPath } = getUploadPath(folder);
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${uuidv4()}${ext}`;
      if (!req.uploadedFiles) req.uploadedFiles = {};
      const folder = file.fieldname === 'preview' ? 'previews' : 'videos';
      req.uploadedFiles[file.fieldname] = `uploads/${folder}/${filename}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Le fichier doit être une vidéo.'));
    }
    if (file.fieldname === 'preview' && !file.mimetype.startsWith('image/')) {
      return cb(new Error('Le fichier doit être une image.'));
    }
    cb(null, true);
  }
});

module.exports = { articleUploader };