// services/videoWorker.js
const { Worker } = require('bullmq');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()

const { isExecutableFile, analyzeVideo, extractFrameFromVideo, scanForNSFW } = require('../services/videoProcess');
const { transcodeToMp4 } = require('../services/transcodeToMp4');
const { transcodeToHLS } = require('../services/transcodeToHls');

const { ensureDir } = require('../utils/ensureDir')
const { safeUnlink } = require('../utils/safeUnlink');
const { getUploadPath } = require('../utils/getUploadPath');
const { notifyAdminValidation } = require('../utils/notifyAdminValidation');

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
    const { articleId, fullVideoPath, runType = 'create', lang } = job.data;

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
    const prevHlsDirRel = article.hlsDir || null;
    const prevHlsPlaylistRel = article.hlsPlaylist || null;

    // We'll keep track of any output we produce to clean them on failure
    let producedThumbAbs = null;
    let producedThumbRel = null;
    let producedVideoAbs = null;
    let producedVideoRel = null;
    let producedHlsDirAbs = null;
    let producedHlsDirRel = null;
    let producedHlsMasterRel = null;

    try {
      // 1) Move article to "processing" ASAP
      await article.update({
        processingStatus: 'processing',
        processingProgress: 5,
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
      await article.update({ processingProgress: 10 });

      const analysis = await analyzeVideo(absInput); // <- returns { duration, ... }
      const durationSec = Number(analysis?.duration || 0);
      await article.update({ processingProgress: 20 });

      // 2.5) Transcode original -> optimized MP4 (keep original in DB as originalVideo)
      // We write under /uploads/videos/processed/<uuidv4>.mp4 (relative path in DB)
      const processedRel = `uploads/videos/processed/${uuidv4()}.mp4`;
      const processedAbs = toAbs(processedRel);

      // Ensure folder exists (safety on fresh servers)
      ensureDir(path.dirname(processedAbs));

      // Map ffmpeg percent (0..100) to a 20..50 window in our DB to avoid spike updates
      let lastDbReport = 20;
      await transcodeToMp4(absInput, processedAbs, async pct => {
        // Map 0..100 → 20..50 (linear)
        const mapped = Math.max(20, Math.min(50, 20 + Math.floor((pct || 0) * 0.60)));
        if (mapped - lastDbReport >= 2) {
          lastDbReport = mapped;
          try { await article.update({ processingProgress: mapped }); } catch (_) {}
        }
      });

      // Remember outputs for cleanup on failure
      producedVideoAbs = processedAbs;
      producedVideoRel = processedRel;

      // Make sure progress reflects completion of transcode
      await article.update({ processingProgress: Math.max(lastDbReport, 40) });


      // 3) Transcode processed MP4 -> HLS multi-bitrate pack
      // Decide an output directory (unique per run). We store it in DB for easy deletion later.
      const hlsDirRel = `uploads/hls/${uuidv4()}`;
      const hlsDirAbs = toAbs(hlsDirRel);
      ensureDir(hlsDirAbs);

      await transcodeToHLS(
        producedVideoAbs,
        hlsDirAbs,
        hlsDirRel,
        async (pct) => {
          // Map HLS local 0..100 → 50..90
          const mapped = Math.max(50, Math.min(90, 50 + Math.floor((pct || 0) * 0.15)));
          try { await article.update({ processingProgress: mapped }); } catch (_) {}
        },
        { durationSec } // <- gives HLS step a duration reference
      ).then(({ masterAbs, masterRel, outDirAbs, outDirRel }) => {
        producedHlsDirAbs = outDirAbs;
        producedHlsDirRel = outDirRel;
        producedHlsMasterRel = masterRel;
      });

      // ─────────────────────────────────────────────────────────────
      // ⚠️ TEST ONLY: FORCE FAILURE HERE (uncomment to simulate fail)
      // throw new Error('FORCED_FAIL');
      // ─────────────────────────────────────────────────────────────

      await article.update({ processingProgress: 95 });
      // 4) Generate thumbnail from the *optimized* video to match final look
      const thumbnailName = `thumbnail-${uuidv4()}.jpg`;
      const { fullPath: thumbFullAbs, dbPath: thumbRel } = getUploadPath('thumbnails', thumbnailName);
      if (!fs.existsSync(path.dirname(thumbFullAbs))) {
        fs.mkdirSync(path.dirname(thumbFullAbs), { recursive: true });
      }
      await extractFrameFromVideo(producedVideoAbs, thumbFullAbs);
      producedThumbAbs = thumbFullAbs;
      producedThumbRel = thumbRel;

      await article.update({ processingProgress: 98 });

      // 5) NSFW screening (throws if not ok)
      await scanForNSFW(thumbFullAbs);

      // 6) Finalize: keep original video path, attach generated thumbnail
      await article.update({
        video: producedVideoRel,
        thumbnail: producedThumbRel,
        hlsPlaylist: producedHlsMasterRel,
        hlsDir: producedHlsDirRel,
        processingStatus: 'ready',
        processingProgress: 100,
        processingError: null,
        originalVideo: null, // consumed successfully
      });
      
      await notifyAdminValidation(article, lang);

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
            // remove previous HLS pack (directory) if different
          if (prevHlsDirRel && prevHlsDirRel !== producedHlsDirRel) {
            try { fs.rmSync(toAbs(prevHlsDirRel), { recursive: true, force: true }); } catch (_) {}
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
      // cleanup HLS folder if it was created
      if (producedHlsDirAbs) {
        try { fs.rmSync(producedHlsDirAbs, { recursive: true, force: true }); } catch (_) {}
      }

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