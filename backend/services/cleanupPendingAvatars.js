const fs = require('fs');
const path = require('path');

const ROOT = process.env.NODE_ENV === 'development' ? process.cwd() : '/app/public';
const PENDING_DIR = path.join(ROOT, 'uploads', 'avatars', 'pending');
const THRESHOLD_MS = Number(process.env.PENDING_SIGNUP_TTL_SEC || 48 * 60 * 60 * 1000);


async function cleanPendingAvatars() {
  if (!fs.existsSync(PENDING_DIR)) return;
  const now = Date.now();
  for (const f of fs.readdirSync(PENDING_DIR)) {
    const full = path.join(PENDING_DIR, f);
    try {
      const st = fs.statSync(full);
      if (now - st.mtimeMs > THRESHOLD_MS) {
        fs.unlinkSync(full);
      }
    } catch {}
  }
}

module.exports = { cleanPendingAvatars };
