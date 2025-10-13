// services/transcodeToHls.js
const { spawn } = require('child_process');
const path = require('path');
const { ensureDir } = require('../utils/ensureDir');

/**
 * Transcode a normalized MP4 into multi-bitrate HLS (CMAF/fMP4) with a 240p floor for slow networks.
 *
 * @param {string} inputAbs  absolute input file
 * @param {string} outDirAbs absolute output dir (created if missing)
 * @param {string} outDirRel relative output dir (for DB)
 * @param {(pct:number)=>void} [onProgress] optional progress callback (0..100)
 * @param {{ durationSec?: number, fpsHint?: number }} [opts] optional hints (duration helps to compute %)
 *
 * Returns: { masterAbs, masterRel, outDirAbs, outDirRel }
 */
function transcodeToHLS(inputAbs, outDirAbs, outDirRel, onProgress, opts = {}) {
  return new Promise((resolve, reject) => {
    ensureDir(outDirAbs);

    const durationSec = Number(opts.durationSec || 0); // helps compute % by parsing ffmpeg "time="
    const masterPlName = 'master.m3u8';
    const masterAbs = path.join(outDirAbs, masterPlName);
    const masterRel = path.join(outDirRel, masterPlName).replace(/\\/g, '/');

    // NOTE: Bitrates tuned to be conservative for mobile (video bitrate only; audio added below)
    // 240p  (426x240) ~ 350 kb/s v + 64 kb/s a
    // 360p  (640x360) ~ 600 kb/s v + 96 kb/s a
    // 480p  (854x480) ~ 1.0 Mb/s  v + 96 kb/s a
    // 720p  (1280x720) ~ 2.0 Mb/s v + 128 kb/s a
    // 1080p (1920x1080) ~ 3.5 Mb/s v + 128 kb/s a
    //
    // GOP/keyframe for ~24–30 fps, segments of 4s => 2 keyframes per segment:
    // -g 48 -keyint_min 48 -sc_threshold 0 (works fine for 24–30 fps sources).
    const args = [
      '-y',
      '-i', inputAbs,

      // 240p (v:0)
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:0', 'h264', '-profile:v:0', 'main', '-preset', 'veryfast',
      '-vf:v:0', 'scale=w=426:h=240:force_original_aspect_ratio=decrease',
      '-b:v:0', '350k', '-maxrate:v:0', '350k', '-bufsize:v:0', '700k',
      '-g:v:0', '48', '-keyint_min:v:0', '48', '-sc_threshold:v:0', '0',
      '-c:a:0', 'aac', '-b:a:0', '64k',

      // 360p (v:1)
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:1', 'h264', '-profile:v:1', 'main',
      '-vf:v:1', 'scale=w=640:h=360:force_original_aspect_ratio=decrease',
      '-b:v:1', '600k', '-maxrate:v:1', '600k', '-bufsize:v:1', '1200k',
      '-g:v:1', '48', '-keyint_min:v:1', '48', '-sc_threshold:v:1', '0',
      '-c:a:1', 'aac', '-b:a:1', '96k',

      // 480p (v:2)
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:2', 'h264', '-profile:v:2', 'main',
      '-vf:v:2', 'scale=w=854:h=480:force_original_aspect_ratio=decrease',
      '-b:v:2', '1000k', '-maxrate:v:2', '1000k', '-bufsize:v:2', '2000k',
      '-g:v:2', '48', '-keyint_min:v:2', '48', '-sc_threshold:v:2', '0',
      '-c:a:2', 'aac', '-b:a:2', '96k',

      // 720p (v:3)
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:3', 'h264', '-profile:v:3', 'high',
      '-vf:v:3', 'scale=w=1280:h=720:force_original_aspect_ratio=decrease',
      '-b:v:3', '2000k', '-maxrate:v:3', '2000k', '-bufsize:v:3', '4000k',
      '-g:v:3', '48', '-keyint_min:v:3', '48', '-sc_threshold:v:3', '0',
      '-c:a:3', 'aac', '-b:a:3', '128k',

      // 1080p (v:4) — remove this block + update var_stream_map to reduce CPU
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:4', 'h264', '-profile:v:4', 'high',
      '-vf:v:4', 'scale=w=1920:h=1080:force_original_aspect_ratio=decrease',
      '-b:v:4', '3500k', '-maxrate:v:4', '3500k', '-bufsize:v:4', '7000k',
      '-g:v:4', '48', '-keyint_min:v:4', '48', '-sc_threshold:v:4', '0',
      '-c:a:4', 'aac', '-b:a:4', '128k',

      // HLS CMAF/fMP4 muxing
      '-f', 'hls',
      '-hls_time', '4',
      '-hls_segment_type', 'fmp4',
      '-hls_fmp4_init_filename', 'init.mp4',
      '-hls_flags', 'independent_segments',
      '-hls_playlist_type', 'vod',
      '-master_pl_name', masterPlName,

      // segment / variant naming
      '-hls_segment_filename', path.join(outDirAbs, 'v%v', 'seg_%03d.m4s'),
      '-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3 v:4,a:4',
      path.join(outDirAbs, 'v%v', 'index.m3u8'),
    ];

    const ff = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });

    // Very rough % based on "time=HH:MM:SS.xx" lines if duration is known
    let lastPct = 0;
    ff.stderr.on('data', (buf) => {
      const line = buf.toString();
      // Example: ... time=00:01:23.45 ...
      const m = line.match(/time=(\d+):(\d+):(\d+\.\d+)/);
      if (m && durationSec > 0) {
        const hh = Number(m[1]), mm = Number(m[2]), ss = Number(m[3]);
        const t = hh * 3600 + mm * 60 + ss;
        let pct = Math.max(0, Math.min(100, Math.floor((t / durationSec) * 100)));
        // Smooth / throttle updates
        if (pct - lastPct >= 3) {
          lastPct = pct;
          if (onProgress) onProgress(pct);
        }
      }
    });

    ff.on('error', reject);

    ff.on('close', (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited with code ${code}`));
      // Ensure UI sees 100%
      if (onProgress) onProgress(100);
      resolve({
        masterAbs,
        masterRel,
        outDirAbs,
        outDirRel,
      });
    });
  });
}

module.exports = { transcodeToHLS };
