// services/transcodeHls.js
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const { ensureDir } = require('../utils/ensureDir');

/**
 * Transcode a normalized MP4 into HLS (single variant CMAF/fMP4).
 * Returns { masterAbs, masterRel, outDirAbs, outDirRel }.
 */
function transcodeToHLS(inputAbs, outDirAbs, outDirRel, onProgress) {
  return new Promise((resolve, reject) => {
    ensureDir(outDirAbs);

    // We write one variant playlist "index.m3u8" + master "master.m3u8"
    const variantPlName = 'index.m3u8';
    const variantAbs = path.join(outDirAbs, variantPlName);
    const masterPlName = 'master.m3u8';
    const masterAbs = path.join(outDirAbs, masterPlName);
    const masterRel = path.join(outDirRel, masterPlName).replace(/\\/g, '/');

    let lastPct = 0;

    ffmpeg(inputAbs)
      // map video + optional audio (note each token is separated)
      .outputOptions([
        '-map', '0:v:0',
        '-map', '0:a:0?',         // optional audio stream
        // video settings (keep them light, the MP4 est déjà normalisé)
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-profile:v', 'main',
        // GOP/keyframe (adapté au hls_time 4s)
        '-sc_threshold', '0',
        '-g', '48',
        '-keyint_min', '48',

        // HLS (CMAF/fMP4)
        '-hls_time', '4',
        '-hls_segment_type', 'fmp4',
        '-hls_fmp4_init_filename', 'init.mp4',
        '-hls_playlist_type', 'vod',
        '-hls_flags', 'independent_segments',
        '-master_pl_name', masterPlName,

        // Output format
        '-f', 'hls',
      ])
      .audioCodec('aac')
      .audioBitrate('128k')
      .on('progress', p => {
        const pct = Math.max(1, Math.min(99, Math.floor(p.percent || 0)));
        if (pct - lastPct >= 5) {
          lastPct = pct;
          if (onProgress) onProgress(pct);
        }
      })
      .on('end', () => {
        resolve({
          masterAbs,
          masterRel,
          outDirAbs,
          outDirRel,
        });
      })
      .on('error', reject)
      .save(variantAbs);
  });
}

module.exports = { transcodeToHLS };
