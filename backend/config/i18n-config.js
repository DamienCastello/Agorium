const i18n = require('i18n');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

i18n.configure({
  locales: ['en', 'fr'], // Définissez les langues supportées
  directory: path.join(__dirname, 'locales'), // Dossier contenant les fichiers de traduction
  defaultLocale: 'fr', // Langue par défaut
  queryParameter: 'lang', // Paramètre de requête pour changer la langue (ex. ?lang=fr)
  cookie: 'lang', // Cookie pour stocker la langue choisie par l'utilisateur
  api: {
    '__': 't', // On peut utiliser `req.t('key')` au lieu de `req.__('key')`
  },
  register: global, // Permet d'utiliser `__()` globalement
  autoReload: isDev,       // OK en dev
  syncFiles: isDev,        // en prod => pas d’écriture automatique
  updateFiles: isDev, // en prod => n’écrit pas de clés manquantes
  objectNotation: true, // Support pour les clés imbriquées (ex. auth.login.success)
});

module.exports = i18n;