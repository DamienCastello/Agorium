// services/videoProcess.js
const NSFW = require('nsfwjs');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const tf = require('@tensorflow/tfjs-node');
const { createCanvas, loadImage } = require('canvas');

// --- Config switches (tune to your needs) ---
// If you want to strictly require an audio stream:
const REQUIRE_AUDIO = false;

// Cache the NSFW model so we don't reload it for every job
let nsfwModelPromise = null;

/**
 * Scan a thumbnail for NSFW content.
 * - Loads the NSFW model once and reuses it.
 */
async function scanForNSFW(imagePath) {
  // Load the model once
  if (!nsfwModelPromise) nsfwModelPromise = NSFW.load();
  const model = await nsfwModelPromise;

  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  const input = tf.browser.fromPixels(canvas);
  const predictions = await model.classify(input);

  const nsfwContent = predictions.some(p => p.className === 'Porn' && p.probability > 0.7);
  if (nsfwContent) {
    // Keep message generic (no req.t here)
    throw new Error('Suspicious video content nsfw detected.');
  }
}

/**
 * Extract a single frame from video to produce a thumbnail image.
 */
async function extractFrameFromVideo(filePath, outputImagePath) {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .screenshots({
        count: 1,
        folder: path.dirname(outputImagePath),
        filename: path.basename(outputImagePath),
      })
      .on('end', resolve)
      .on('error', reject);
  });
}

/**
 * Analyze a video to reject obviously bloated / invalid files early.
 * - Uses ffprobe for metadata
 * - Falls back to fs.stat for size if format.size is missing
 * - Computes effective bitrate from size/duration
 * - Sets a resolution-based expected max bitrate (with tolerance)
 * - Relaxes tolerance for very short clips to avoid false positives
 */
function analyzeVideo(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

      if (!videoStream) return reject(new Error('No video track found.'));

      // --- Extracted metadata ---
      // Try ffprobe size first, fallback to fs.statSync if missing/zero
      let sizeBytes = Number(metadata?.format?.size || 0);
      if ((!Number.isFinite(sizeBytes) || sizeBytes <= 0) && fs.existsSync(filePath)) {
        try { sizeBytes = fs.statSync(filePath).size; } catch (_) {}
      }

      const durationSec = Number(metadata?.format?.duration || 0);
      const { width, height, codec_name: vCodec } = videoStream;
      const aCodec = audioStream ? audioStream.codec_name : null;

      // --- Basic sanity guards (cheap) ---
      if (!Number.isFinite(durationSec) || durationSec <= 0) {
        return reject(new Error('Invalid video duration.'));
      }
      if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
        return reject(new Error('Invalid file size.'));
      }
      if (!width || !height) {
        return reject(new Error('Invalid video resolution.'));
      }

      // --- Codec allowlist (light guard; we transcode anyway) ---
      const allowedVideoCodecs = new Set(['h264', 'vp9', 'hevc', 'av1']);
      if (vCodec && !allowedVideoCodecs.has(vCodec)) {
        return reject(new Error('Unanswered video codec detected.'));
      }

      // --- Compute effective bitrate from file size (bps -> Mbps) ---
      const effectiveBitrateBps = (sizeBytes * 8) / durationSec;
      const effectiveMbps = effectiveBitrateBps / 1_000_000;

      // --- Resolution-based expected max bitrate (video+audio) ---
      function expectedMaxMbpsByResolution(w, h) {
        const maxDim = Math.max(w || 0, h || 0);
        if (maxDim <= 480)   return 3;   // 480p
        if (maxDim <= 720)   return 6;   // 720p
        if (maxDim <= 1080)  return 10;  // 1080p
        if (maxDim <= 1440)  return 18;  // 1440p
        return 28;                        // 2160p/4K
      }
      const expectedMaxMbps = expectedMaxMbpsByResolution(width, height);

      // --- Tolerance: relax for very short clips (<5s) to avoid false positives ---
      const shortClip = durationSec < 5;
      const tolerance = shortClip ? 2.0 : 1.2; // 200% for <5s, else 20%
      const hardCapMbps = expectedMaxMbps * tolerance;

      // --- Global hard size cap (safety valve) ---
      const MAX_FILE_BYTES = 4 * 1024 * 1024 * 1024; // 4 GiB
      if (sizeBytes > MAX_FILE_BYTES) {
        return reject(new Error('File too large (Safety CAP exceeded).'));
      }

      // --- Reject if clearly bloated for its resolution/duration ---
      if (effectiveMbps > hardCapMbps) {
        return reject(new Error(
          `Too heavy/ineffective video for its resolution. ` +
          `(effective bitrate ≈ ${effectiveMbps.toFixed(1)} Mbps, max tolerated ≈ ${hardCapMbps.toFixed(1)} Mbps ` +
          `for ${width}x${height}, duration ${durationSec.toFixed(1)}s)`
        ));
      }

      // --- Optional audio presence check ---
      if (REQUIRE_AUDIO && !aCodec) {
        return reject(new Error('No audio flow detected.'));
      }

      // All good → return a compact summary
      resolve({
        duration: durationSec,
        size: sizeBytes,
        width,
        height,
        codec: vCodec,
        audioCodec: aCodec,
        effectiveMbps,
        limitMbps: hardCapMbps,
      });
    });
  });
}

/**
 * Quick executability probe:
 * - ffprobe must succeed
 * - must contain at least one video stream
 */
function isExecutableFile(filePath) {
  // Always probe: we accept multiple containers (.mp4, .mov, .m4v, .webm)
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error(`ffprobe error: ${err.message}`);
        return reject(new Error(`Corrupt or non valid video file: ${filePath}`));
      }
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        return reject(new Error(`No video flow found in the file: ${filePath}`));
      }
      resolve();
    });
  });
}

module.exports = { scanForNSFW, extractFrameFromVideo, analyzeVideo, isExecutableFile };
