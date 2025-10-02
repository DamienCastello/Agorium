const nodemailer = require("nodemailer");
const i18n = require('../config/i18n-config');


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
  const t = (...args) => i18n.__({ phrase: args[0], locale: lang || 'en' });
  const subject = t('auth.mailer_verification.subject');
  const html = t('auth.mailer_verification.html');

  const info = await transporter.sendMail({
    from: `"Agorium" <${process.env.EMAIL_FROM}>`,
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
  const t = (...args) => i18n.__({ phrase: args[0], locale: lang || 'en' });
  const subject = t('auth.mailer_reset.subject');
  const html = t('auth.mailer_reset.html');

  const info = await transporter.sendMail({
    from: `"Agorium" <${process.env.EMAIL_FROM}>`,
    to,
    subject: subject,
    html: `${html} <a href="${link}">${link}</a></p>`,
  });
  console.log('[mailer] Reset sent:', info.messageId, info.response);
  return info;
  }