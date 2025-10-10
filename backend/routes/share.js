const express = require('express');
const { Article } = require('../models');
const router = express.Router();

// Simple escaper for HTML attributes
function esc(s='') {
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

// ENVs: set them in docker-compose backend/worker
// FRONT_URL: public site (the SPA)
// API_PUBLIC_URL: backend public origin serving /uploads (⚠️ no /api/v1 here)
const FRONT_URL = process.env.VITE_FRONT_URL || 'http://localhost:5173';
const API_PUBLIC_URL = process.env.API_PUBLIC_URL || 'http://localhost:3000';
const PUBLIC_BANNER = `${FRONT_URL}/og-banner.jpg`;

router.get('/article/:id', async (req, res) => {
  try {
    const a = await Article.findByPk(req.params.id, {
      attributes: ['id','title','description','thumbnail','preview','isPrivate','privateLink']
    });
    if (!a) return res.status(404).send('Not found');

    // Where humans should land
    const pageUrl = a.isPrivate
      ? `${FRONT_URL}/articles/private/${a.privateLink}`
      : `${FRONT_URL}/articles/${a.id}`;

    // Best image: thumbnail > preview > default banner
    const image =
      (a.thumbnail && `${API_PUBLIC_URL}/${a.thumbnail}`) ||
      (a.preview   && `${API_PUBLIC_URL}/${a.preview}`)   ||
      `${FRONT_URL}/og-banner.jpg`;

    const title = a.title || 'Agorium';
    const desc  = a.description || 'La plateforme de diffusion libre';

    // Static OG/Twitter metas for crawlers + instant redirect for humans
    const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0; url=${esc(pageUrl)}">
</head>
<body>Redirection… <a href="${esc(pageUrl)}">ouvrir</a></body>
</html>`;
    res.set('Content-Type', 'text/html; charset=utf-8').send(html);
  } catch (e) {
    console.error('share error:', e?.message || e);
    res.status(500).send('error');
  }
});

// Optional: private link variant
router.get('/article/private/:privateLink', async (req, res) => {
  try {
    const a = await Article.findOne({ where: { privateLink: req.params.privateLink } });
    if (!a) return res.status(404).send('Not found');

    const pageUrl = `${FRONT_URL}/articles/private/${a.privateLink}`;
    const image =
      (a.thumbnail && `${API_PUBLIC_URL}/${a.thumbnail}`) ||
      (a.preview   && `${API_PUBLIC_URL}/${a.preview}`)   ||
      `${FRONT_URL}/og-banner.jpg`;

    const title = a.title || 'Agorium';
    const desc  = a.description || 'La plateforme de diffusion libre';

    const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:type" content="article">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0; url=${esc(pageUrl)}">
</head>
<body>Redirection… <a href="${esc(pageUrl)}">ouvrir</a></body>
</html>`;
    res.set('Content-Type', 'text/html; charset=utf-8').send(html);
  } catch (e) {
    console.error('share error:', e?.message || e);
    res.status(500).send('error');
  }
});

router.get('/site', (req, res) => {
  const rawPath = req.params[0] || '';musique', etc.
  const cleanPath = rawPath.replace(/^\/+/, '');
  const pageUrl = `${FRONT_URL}/${cleanPath}`;

  const title = 'Agorium';
  const desc  = '';

  const html = `<!doctype html>
<html lang="fr"><head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:image" content="${esc(PUBLIC_BANNER)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(PUBLIC_BANNER)}">
<meta http-equiv="refresh" content="0; url=${esc(pageUrl)}">
</head><body>Redirection… <a href="${esc(pageUrl)}">ouvrir</a></body></html>`;
  res.set('Content-Type', 'text/html; charset=utf-8').send(html);
});

module.exports = router;
