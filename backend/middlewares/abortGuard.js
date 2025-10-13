const path = require('path');
const { safeUnlink } = require('../utils/safeUnlink');

const isDev = process.env.NODE_ENV === 'development';

/**
 * Early abort/close guard:
 * - We attach listeners BEFORE multer to ensure we catch early aborts.
 * - If the connection closes without sending a full response (no 'finish'),
 *   we run a cleanup that inspects whatever paths are available at that time.
 */
function preMulterAbortGuard(req, res, next) {
  let finished = false;
  let cleaned = false;

  // Mark finished responses (client got a proper HTTP response)
  res.on('finish', () => {
    finished = true;
  });

  // Unified cleanup routine (idempotent)
  function cleanup() {
    if (cleaned) return;
    cleaned = true;

    try {
      // (English) Build an array of absolute paths we might have produced.
      const paths = [];

      // Your normalized uploader paths (relative DB-style) if present
      if (req.uploadedFiles?.video) {
        const rel = req.uploadedFiles.video.replace('/app/public', '');
        const abs = isDev ? path.resolve(rel) : path.join('/app/public', rel);
        paths.push(abs);
      }
      if (req.uploadedFiles?.preview) {
        const rel = req.uploadedFiles.preview.replace('/app/public', '');
        const abs = isDev ? path.resolve(rel) : path.join('/app/public', rel);
        paths.push(abs);
      }

      // Fallback to multer disk paths (absolute) if available
      if (req.files?.video?.[0]?.path) paths.push(req.files.video[0].path);
      if (req.files?.preview?.[0]?.path) paths.push(req.files.preview[0].path);

      // Remove discovered files (best-effort)
      paths.forEach(safeUnlink);
    } catch (_) {
      // swallow
    }
  }

  // If connection closes and we didn't 'finish', assume abort → cleanup
  // (English) 'close' fires for many disconnect scenarios behind proxies.
  res.on('close', () => {
    if (!finished) cleanup();
  });

  // Keep the legacy 'aborted' as well (some stacks still fire it reliably)
  req.on('aborted', () => {
    if (!finished) cleanup();
  });

  next();
}

module.exports = { preMulterAbortGuard };
