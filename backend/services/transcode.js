const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

/** Ensure parent directory exists. */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Transcode to a streaming-friendly MP4:
 * - libx264 video, yuv420p for wide compatibility
 * - CRF-based quality (lower is better; 23 is a solid default)
 * - preset veryfast for speed/size tradeoff
 * - +faststart to move moov atom at the beginning (progressive playback)
 * - Conditional downscale to max width=1280 (no upscale)
 *
 * onProgress(pct) is optional and should be throttled by the caller to avoid DB spam.
 */
function transcodeToMp4(inputAbs, outputAbs, onProgress) {
  return new Promise((resolve, reject) => {
    ensureDir(path.dirname(outputAbs));

    let lastReported = 0;

    ffmpeg(inputAbs)
      // Video
      .videoCodec('libx264')
      .outputOptions([
        // "Only downscale if width > 1280; keep aspect; never upscale"
        "-vf scale='if(gt(iw,1280),1280,iw)':-2",
        // "Use CRF for quality control (18~28); 23 is a good default"
        '-crf 23',
        // "Speed/size tradeoff: veryfast is usually fine for server-side"
        '-preset veryfast',
        // "Wider compatibility across players"
        '-pix_fmt yuv420p',
        // "Enable progressive playback"
        '-movflags +faststart',
        // "Cap instantaneous bitrate a bit to avoid spikes (optional)"
        '-maxrate 3000k',
        '-bufsize 6000k',
      ])
      // Audio
      .audioCodec('aac')
      .audioBitrate('128k')
      .on('progress', p => {
        // p.percent is provided by fluent-ffmpeg (approximate)
        const pct = Math.min(99, Math.max(1, Math.floor(p.percent || 0)));
        if (pct - lastReported >= 5) {
          lastReported = pct;
          if (onProgress) onProgress(pct);
        }
      })
      .on('end', () => resolve())
      .on('error', err => reject(err))
      .save(outputAbs);
  });
}

module.exports = { transcodeToMp4, ensureDir };
