const { spawn } = require('child_process');
const path = require('path');
const { ensureDir } = require('../utils/ensureDir');

/**
 * Transcode a normalized MP4 into **multi-bitrate** HLS (CMAF/fMP4).
 * Produces a master.m3u8 referencing 4 renditions (360p, 480p, 720p, 1080p).
 *
 * Why spawn and not fluent-ffmpeg?
 * - For multi-variant HLS with -var_stream_map, passing explicit per-stream options
 *   (-c:v:0, -b:v:0, -vf:v:0, …) is simpler/stabler with raw args.
 *
 * onProgress(pct) is optional here (HLS pass is usually fast, you already report progress on the MP4 step).
 */
function transcodeToHLS(inputAbs, outDirAbs, outDirRel, onProgress) {
  return new Promise((resolve, reject) => {
    ensureDir(outDirAbs);

    // We’ll create subfolders v0..v3 like:
    //   /.../v0/index.m3u8, seg_000.m4s, init.mp4
    //   ...
    // And a master at:
    //   /.../master.m3u8
    const masterPlName = 'master.m3u8';
    const masterAbs = path.join(outDirAbs, masterPlName);
    const masterRel = path.join(outDirRel, masterPlName).replace(/\\/g, '/');

    // Ladder tuned for mobile:
    // 360p ~0.7–0.8 Mbps total
    // 480p ~1.1–1.2 Mbps total
    // 720p ~2.1–2.3 Mbps total
    // 1080p ~3.6–3.8 Mbps total
    //
    // Keyframe/GOP aligned to 4s segments:
    //   -g 48 -keyint_min 48 for ~24 fps (≈2s GOP, 2 GOPs per 4s segment)
    // If your sources are 30 fps, prefer g=60/keyint_min=60.
    // We keep g=48 as a good default; it still works fine in practice.
    //
    // CMAF/fMP4:
    //   -hls_segment_type fmp4
    //
    // One output with var_stream_map generating variant playlists and segments:
    const args = [
      '-y',
      '-i', inputAbs,

      // 360p (v:0)
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:0', 'h264', '-profile:v:0', 'main', '-preset', 'veryfast',
      '-vf:v:0', 'scale=w=640:h=360:force_original_aspect_ratio=decrease',
      '-b:v:0', '600k', '-maxrate:v:0', '600k', '-bufsize:v:0', '1200k',
      '-g:v:0', '48', '-keyint_min:v:0', '48', '-sc_threshold:v:0', '0',
      '-c:a:0', 'aac', '-b:a:0', '96k',

      // 480p (v:1)
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:1', 'h264', '-profile:v:1', 'main',
      '-vf:v:1', 'scale=w=854:h=480:force_original_aspect_ratio=decrease',
      '-b:v:1', '1000k', '-maxrate:v:1', '1000k', '-bufsize:v:1', '2000k',
      '-g:v:1', '48', '-keyint_min:v:1', '48', '-sc_threshold:v:1', '0',
      '-c:a:1', 'aac', '-b:a:1', '96k',

      // 720p (v:2)
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:2', 'h264', '-profile:v:2', 'high',
      '-vf:v:2', 'scale=w=1280:h=720:force_original_aspect_ratio=decrease',
      '-b:v:2', '2000k', '-maxrate:v:2', '2000k', '-bufsize:v:2', '4000k',
      '-g:v:2', '48', '-keyint_min:v:2', '48', '-sc_threshold:v:2', '0',
      '-c:a:2', 'aac', '-b:a:2', '128k',

      // 1080p (v:3)
      '-map', '0:v:0', '-map', '0:a:0?',
      '-c:v:3', 'h264', '-profile:v:3', 'high',
      '-vf:v:3', 'scale=w=1920:h=1080:force_original_aspect_ratio=decrease',
      '-b:v:3', '3500k', '-maxrate:v:3', '3500k', '-bufsize:v:3', '7000k',
      '-g:v:3', '48', '-keyint_min:v:3', '48', '-sc_threshold:v:3', '0',
      '-c:a:3', 'aac', '-b:a:3', '128k',

      // HLS packaging (CMAF/fMP4), 4s segments for quicker ABR on mobile
      '-f', 'hls',
      '-hls_time', '4',
      '-hls_segment_type', 'fmp4',
      '-hls_fmp4_init_filename', 'init.mp4',
      '-hls_flags', 'independent_segments',
      '-hls_playlist_type', 'vod',
      '-master_pl_name', masterPlName,
      // segment & playlist naming (v%v expands to v0..v3)
      '-hls_segment_filename', path.join(outDirAbs, 'v%v', 'seg_%03d.m4s'),
      '-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3',
      path.join(outDirAbs, 'v%v', 'index.m3u8'),
    ];

    const ff = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });

    // Optional: very rough progress (ffmpeg doesn't emit % here)
    ff.stderr.on('data', (buf) => {
      const line = buf.toString();
      // If you want, parse "time=" lines to compute pct; otherwise:
      if (onProgress) onProgress(100); // keep UI near the end since MP4 step already tracked
    });

    ff.on('error', reject);

    ff.on('close', (code) => {
      if (code !== 0) return reject(new Error(`ffmpeg exited with code ${code}`));
      // Return locations for DB storage
      resolve({
        masterAbs,
        masterRel,       // <- save this into Article.hlsPlaylist
        outDirAbs,
        outDirRel,       // <- save this into Article.hlsDir (to purge later)
      });
    });
  });
}

module.exports = { transcodeToHLS };
