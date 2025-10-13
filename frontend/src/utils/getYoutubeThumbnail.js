import extractVideoId from './extractYoutubeUrl';

// Retourne une miniature YouTube “fiable”
export default function getYoutubeThumbnail(youtubeUrlOrId) {
  // 1) Essaye d’extraire depuis une URL
  let id = extractVideoId(youtubeUrlOrId);

  // 2) Si extract échoue, on tolère un ID brut (11 chars alphanum/_/-)
  if (!id && typeof youtubeUrlOrId === 'string') {
    const maybeId = youtubeUrlOrId.trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(maybeId)) id = maybeId;
  }

  if (!id) return 'https://img.youtube.com/vi/404/default.jpg'; // fallback ultime

  // hqdefault est beaucoup plus fiable que maxresdefault
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
