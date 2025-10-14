const ALLOWED = ['fr', 'en'];
function safeLocale(input, fallback = 'en') {
  if (!input) return fallback;
  const v = String(input).toLowerCase();
  return ALLOWED.includes(v) ? v : fallback;
}
module.exports = { safeLocale };
