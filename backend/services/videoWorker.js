// services/videoWorker.js
const { Worker } = require('bullmq');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { isExecutableFile, analyzeVideo, extractFrameFromVideo, scanForNSFW } = require('../services/video');
const { safeUnlink } = require('../utils/safeUnlink');
const { getUploadPath } = require('../utils/getUploadPath');
const { Article } = require('../models');

// ---- Small helpers ---- //
const isDev = process.env.NODE_ENV === 'development';
function toAbs(rel) {
  if (!rel) return null;
  return isDev ? path.resolve(rel) : path.join('/app/public', rel);
}

// Redis connection (must match queue definition)
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
};

// Create a worker for the "video-processing"
const videoWorker = new Worker(
  'video-processing',
  async job => {
    const { articleId, fullVideoPath } = job.data;

    // 0) Fetch the article; bail early if missing
    const article = await Article.findByPk(articleId);
    if (!article) {
      // Mark failed in Bull; DB entry does not exist → nothing to update further
      throw new Error(`Article ${articleId} not found`);
    }

    // We'll keep track of any output we produce to clean them on failure
    let producedThumbAbs = null;
    let producedThumbRel = null;

    try {
      // 1) Move article to "processing" ASAP
      await article.update({
        processingStatus: 'processing',
        processingProgress: 10,
        processingError: null,
      });

      // Resolve input (either passed explicitly, or from DB)
      const absInput = fullVideoPath || toAbs(article.originalVideo);
      if (!absInput || !fs.existsSync(absInput)) {
        // Input file is missing → permanent failure; keep originalVideo null-checkable for retry
        await article.update({
          processingStatus: 'failed',
          processingError: 'input_missing',
          processingProgress: 0,
          processingRetries: (article.processingRetries || 0) + 1,
        });
        throw new Error('Input file missing');
      }

      // 2) Lightweight validations / probes (your helpers may throw on error)
      await isExecutableFile(absInput);
      await article.update({ processingProgress: 30 });

      await analyzeVideo(absInput);
      await article.update({ processingProgress: 50 });

      // ─────────────────────────────────────────────────────────────
      // ⚠️ TEST ONLY: FORCE FAILURE HERE (uncomment to simulate fail)
      // throw new Error('FORCED_FAIL');
      // ─────────────────────────────────────────────────────────────

      // 3) Generate thumbnail path (we keep original video as-is per your current flow)
      const thumbnailName = `thumbnail-${uuidv4()}.jpg`;
      const { fullPath: thumbFullAbs, dbPath: thumbRel } = getUploadPath('thumbnails', thumbnailName);

      // Ensure folder exists (prod safety)
      if (!fs.existsSync(path.dirname(thumbFullAbs))) {
        fs.mkdirSync(path.dirname(thumbFullAbs), { recursive: true });
      }

      // Extract preview frame
      await extractFrameFromVideo(absInput, thumbFullAbs);
      producedThumbAbs = thumbFullAbs;   // remember for cleanup on failure
      producedThumbRel = thumbRel;

      await article.update({ processingProgress: 70 });

      // 4) NSFW screening (throws if not ok)
      await scanForNSFW(thumbFullAbs);
      await article.update({ processingProgress: 90 });

      // 5) Finalize: keep original video path, attach generated thumbnail
      await article.update({
        video: article.originalVideo,     // keep the original uploaded video
        thumbnail: producedThumbRel,      // relative path saved in DB
        processingStatus: 'ready',
        processingProgress: 100,
        processingError: null,
      });

      // Return value is visible in Bull UI/logs
      return { articleId, status: 'ready' };
    } catch (err) {
      // ❌ Anything thrown above ends up here
      // Cleanup partial outputs (do NOT delete originalVideo: we want retry to work)
      safeUnlink(producedThumbAbs);

      // Mark article as failed (if we still have it)
      try {
        await article.update({
          processingStatus: 'failed',
          processingError: err?.message || 'processing_failed',
          processingProgress: 0,
          processingRetries: (article.processingRetries || 0) + 1,
        });
      } catch {}

      // Re-throw so Bull marks the job as failed
      throw err;
    }
  },
  { connection }
);

// Optional: logs
videoWorker.on('failed', (job, err) => {
  console.error(`[worker] Job ${job?.id} failed:`, err?.message || err);
});

videoWorker.on('completed', job => {
  console.log(`[worker] Job ${job?.id} completed`);
});

module.exports = { videoWorker };