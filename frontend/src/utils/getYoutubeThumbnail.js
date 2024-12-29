import extractYoutubeUrl from './extractYoutubeUrl';

// Helper to get preview
export default function getYoutubeThumbnail(youtubeUrl) {
    const videoId = extractYoutubeUrl(youtubeUrl);
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }