const nodemailer = require("nodemailer");
const i18n = require('../config/i18n-config');


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });
  
exports.sendVerificationEmail = async (to, link, lang) => {
  const t = (...args) => i18n.__({ phrase: args[0], locale: lang });
  const subject = t('auth.mailer_verification.subject');
  const html = t('auth.mailer_verification.html');
  return transporter.sendMail({
    from: `"Agorium" <${process.env.EMAIL_FROM}>`,
    to,
    subject: subject,
    html: `
      ${html}
      <a href="${link}">${link}</a>
    `
  });
};

 exports.sendPasswordResetEmail = async (to, link, lang) => {
  const t = (...args) => i18n.__({ phrase: args[0], locale: lang });
  const subject = t('auth.mailer_reset.subject');
  const html = t('auth.mailer_reset.html');
    await transporter.sendMail({
      from: `"Agorium" <${process.env.MAIL_USER}>`,
      to,
      subject: subject,
      html: `${html} <a href="${link}">${link}</a></p>`,
    });
  }