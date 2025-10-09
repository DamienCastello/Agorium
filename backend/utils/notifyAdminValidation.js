const { sendAdminsVideoAwaitingValidation } = require('../services/mailer');
const { User } = require('../models');


async function notifyAdminValidation(article, lang) {
  // 🔵 Notify admins here
  try {
    // - We only notify on video pipeline success.
    // - If this worker ran because of an UPDATE with a new video, it also notifies.
    // - Privacy-only changes never reach here (no new video → no worker run).
    const admins = await User.findAll({
      where: { isAdmin: true, emailVerified: true },
      attributes: ['email']
    });
    const recipients = admins.map(a => a.email).filter(Boolean);

    if (recipients.length) {
      const author = await User.findByPk(article.userId, { attributes: ['id', 'pseudo', 'email'] });

      // Lien pour l’admin : soit la page de validation, soit la page article
      // Choisis l’URL qui correspond à ton back-office de validation.
      const frontUrl = process.env.FRONT_URL || process.env.VITE_FRONT_URL || 'http://localhost:5173';
      const moderationLink = `${frontUrl}/validations/${article.isPrivate ? article.privateLink : article.id}`;

      await sendAdminsVideoAwaitingValidation(
        recipients,
        { id: article.id, title: article.title, link: moderationLink },
        { id: author?.id, pseudo: author?.pseudo, email: author?.email || '' },
        lang
      );
    }
  } catch (mailErr) {
    console.warn('[worker] admin notify failed:', mailErr?.message || mailErr);
  }
}

module.exports = { notifyAdminValidation };