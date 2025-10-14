const nodemailer = require("nodemailer");
const i18n = require('../config/i18n-config');
const { safeLocale } = require('../utils/locale');


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),  // 587
  secure: false,                        // STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify()
  .then(() => console.log('[mailer] SMTP ok'))
  .catch(err => console.error('[mailer] SMTP error', err));

exports.sendVerificationEmail = async (to, link, lang) => {
  const locale = safeLocale(lang, 'fr');
  const t = (key) => i18n.__({ phrase: key, locale: locale });
  const subject = t('auth.mailer_verification.subject');
  const html = t('auth.mailer_verification.html');

  const info = await transporter.sendMail({
    from: `Agorium - <${process.env.EMAIL_FROM}>`,
    to,
    subject: subject,
    html: `
      ${html}
      <a href="${link}">${link}</a>
    `
  });
  console.log('[mailer] Verification sent:', info.messageId, info.response);
  return info;
};

exports.sendPasswordResetEmail = async (to, link, lang) => {
  const locale = safeLocale(lang, 'fr');
  const t = (key) => i18n.__({ phrase: key, locale: locale });
  const subject = t('auth.mailer_reset.subject');
  const html = t('auth.mailer_reset.html');

  const info = await transporter.sendMail({
    from: `Agorium - <${process.env.EMAIL_FROM}>`,
    to,
    subject: subject,
    html: `${html} <a href="${link}">${link}</a></p>`,
  });
  console.log('[mailer] Reset sent:', info.messageId, info.response);
  return info;
}

/**
* Send an admin notification when a video is ready for validation.
* @param {string[]} recipients - list of admin emails
* @param {{ id:number, title:string, link:string }} article - minimal article info to include
* @param {{ id:number, pseudo:string, email:string }} author - minimal author info
*
* - Keep body short and actionable (link to moderation/validation view).
* - Use HTML + plain text fallback if you like; here a simple HTML is fine.
*/
exports.sendAdminsVideoAwaitingValidation = async (recipients, article, author, lang) => {
  const locale = safeLocale(lang, 'fr');
  const t = (key) => i18n.__({ phrase: key, locale: locale });
  if (!recipients?.length) return;

  const subject = `Agorium - ${t('validation.new_article_subject')}`;
  const html = `
    <div style="font-family:Arial, sans-serif; line-height:1.4">
      <h2>${t('validation.new_article_html')}</h2>
      <p><strong>${t('validation.title_label')} :</strong> ${article.title}</p>
      <p><strong>${t('validation.author_label')} :</strong> ${author.pseudo} (${author.email})</p>
      <p><a href="${article.link}" target="_blank" rel="noopener">${t('validation.open_label')}</a></p>
      <p style="color:#888; font-size:12px">ID article: ${article.id}</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || `"Agorium" <no-reply@agorium.local>`,
    to: recipients.join(','),
    subject,
    html,
  });
}