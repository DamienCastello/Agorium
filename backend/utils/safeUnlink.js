const fs = require('fs');

// Safe unlink (do not throw if file is missing)
function safeUnlink(absolutePath) {
  try {
    if (absolutePath && fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
  } catch (_) {}
}

module.exports = { safeUnlink };