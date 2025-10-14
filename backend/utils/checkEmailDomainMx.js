const dns = require('dns').promises;

// Liste (non exhaustive) de domaines jetables courants
const DISPOSABLE = new Set([
  'mailinator.com','mailinator.net','mailinator.org','yopmail.com','yopmail.fr','yopmail.net',
  'cool.fr.nf','jetable.org','jetable.fr.nf','courriel.fr.nf','nospam.ze.tc',
  '10minutemail.com','10minutemail.net','10minutemail.co.uk','10minutemail.de',
  'guerrillamail.com','guerrillamail.de','guerrillamail.info','guerrillamail.net','guerrillamail.org','sharklasers.com',
  'trashmail.com','trashmail.de','trashmail.net',
  'getnada.com','nada.ltd','getairmail.com',
  'temp-mail.org','temp-mail.io','tempmail.ninja','tempmail.email','tempmailo.com','moakt.com','fakemail.net',
  'dropmail.me','dispostable.com','mintemail.com','maildrop.cc','spamgourmet.com',
  'mytemp.email','inboxbear.com','mailcatch.com','emailondeck.com','mailnesia.com','spam4.me',
  'throwawaymail.com','throwawaymail.io','linshi-email.com','mailtothis.com','mohmal.com','anonymbox.com',
  'trashmail.ws','spamdecoy.net','fakeinbox.com','fakeinbox.org','tempr.email','mail7.io',
  'armyspy.com','cuvox.de','dayrep.com','einrot.com','fleckens.hu','gustr.com','jourrapide.com','rhyta.com','superrito.com'
]);

/**
 * Vérifie que le domaine de l'email n'est pas jetable
 * ET qu'il possède bien des enregistrements MX.
 */
async function hasValidMx(email) {
  const m = String(email).toLowerCase().match(/@([^@]+)$/);
  if (!m) return false;

  const domain = m[1];

  // Bloque quelques domaines jetables connus
  if (DISPOSABLE.has(domain)) return false;

  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch {
    return false;
  }
}

module.exports = { hasValidMx };
