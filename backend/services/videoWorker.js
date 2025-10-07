// services/videoWorker.js
const { Worker } = require('bullmq');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { isExecutableFile, analyzeVideo, extractFrameFromVideo, scanForNSFW } = require('../services/videoProcess');
const { transcodeToMp4, ensureDir } = require('../services/transcode');

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
    const { articleId, fullVideoPath, runType = 'create' } = job.data;

    // 0) Fetch the article; bail early if missing
    const article = await Article.findByPk(articleId);
    if (!article) {
      // Mark failed in Bull; DB entry does not exist → nothing to update further
      throw new Error(`Article ${articleId} not found`);
    }

    // Keep previous processed assets to optionally delete them on successful UPDATE
    const prevProcessedVideoRel = article.video || null;
    const prevThumbnailRel = article.thumbnail || null;
    const prevOriginalRel = article.originalVideo || null;

    // We'll keep track of any output we produce to clean them on failure
    let producedThumbAbs = null;
    let producedThumbRel = null;
    let producedVideoAbs = null;
    let producedVideoRel = null;

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

      // 2.5) Transcode original -> optimized MP4 (keep original in DB as originalVideo)
      // We write under /uploads/videos/processed/<uuidv4>.mp4 (relative path in DB)
      const processedRel = `uploads/videos/processed/${uuidv4()}.mp4`;
      const processedAbs = toAbs(processedRel);

      // Ensure folder exists (safety on fresh servers)
      ensureDir(path.dirname(processedAbs));

      // Optional small bump before starting to show progress
      await article.update({ processingProgress: 55 });

      // Map ffmpeg percent (0..100) to a 60..90 window in our DB to avoid spike updates
      let lastDbReport = 55;
      await transcodeToMp4(absInput, processedAbs, async pct => {
        // "Map 0..100 -> 60..90" and throttle 3% steps
        const mapped = Math.min(90, 60 + Math.floor((pct || 0) * 0.30));
        if (mapped - lastDbReport >= 3) {
          lastDbReport = mapped;
          try { await article.update({ processingProgress: mapped }); } catch (_) {}
        }
      });

      // Remember outputs for cleanup on failure
      producedVideoAbs = processedAbs;
      producedVideoRel = processedRel;

      // Make sure progress reflects completion of transcode
      await article.update({ processingProgress: Math.max(lastDbReport, 90) });

      // ─────────────────────────────────────────────────────────────
      // ⚠️ TEST ONLY: FORCE FAILURE HERE (uncomment to simulate fail)
      // throw new Error('FORCED_FAIL');
      // ─────────────────────────────────────────────────────────────

      // 3) Generate thumbnail from the *optimized* video to match final look
      const thumbnailName = `thumbnail-${uuidv4()}.jpg`;
      const { fullPath: thumbFullAbs, dbPath: thumbRel } = getUploadPath('thumbnails', thumbnailName);
      if (!fs.existsSync(path.dirname(thumbFullAbs))) {
        fs.mkdirSync(path.dirname(thumbFullAbs), { recursive: true });
      }
      await extractFrameFromVideo(producedVideoAbs, thumbFullAbs);
      producedThumbAbs = thumbFullAbs;
      producedThumbRel = thumbRel;

      await article.update({ processingProgress: 96 });

      // 4) NSFW screening (throws if not ok)
      await scanForNSFW(thumbFullAbs);

      // 5) Finalize: keep original video path, attach generated thumbnail
      await article.update({
        video: producedVideoRel,
        thumbnail: producedThumbRel,
        processingStatus: 'ready',
        processingProgress: 100,
        processingError: null,
        originalVideo: null, // consumed successfully
      });

      // Post-success cleanup
      try {
        // Always remove the original used for this successful run
        if (absInput && fs.existsSync(absInput)) {
          safeUnlink(absInput);
        } else if (prevOriginalRel) {
          safeUnlink(toAbs(prevOriginalRel));
        }

        // Only on UPDATE runs: remove previous processed assets
        if (runType === 'update') {
          if (prevProcessedVideoRel && prevProcessedVideoRel !== producedVideoRel) {
            safeUnlink(toAbs(prevProcessedVideoRel));
          }
          if (prevThumbnailRel && prevThumbnailRel !== producedThumbRel) {
            safeUnlink(toAbs(prevThumbnailRel));
          }
        }
      } catch (cleanupErr) {
        console.warn('[worker] cleanup warning:', cleanupErr?.message || cleanupErr);
      }

      // Return value is visible in Bull UI/logs
      return { articleId, status: 'ready' };
    } catch (err) {
      // ❌ Anything thrown above ends up here
      // Cleanup partial outputs (do NOT delete originalVideo: we want retry to work)
      safeUnlink(producedThumbAbs);
      safeUnlink(producedVideoAbs);

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