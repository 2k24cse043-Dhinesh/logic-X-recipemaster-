import nodemailer from 'nodemailer';
import logger from '../../utils/logger.js';
import { renderAuthEmail } from './templates.js';

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  const smtpPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: smtpPass } : undefined,
  });
  return transporter;
}

export async function sendAuthEmail({ to, name, type, link }) {
  const message = renderAuthEmail(type, { name, link });
  const mailer = getTransporter();
  if (!mailer) {
    if (process.env.NODE_ENV !== 'production' && link) {
      logger.info({ emailType: type, link }, 'Development authentication email link');
    }
    return { delivered: false, developmentPreview: process.env.NODE_ENV !== 'production' };
  }

  try {
    await mailer.sendMail({
      from: process.env.MAIL_FROM || 'RecipeMaster <no-reply@recipemaster.local>',
      to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { delivered: true };
  } catch (error) {
    logger.error({ err: error, emailType: type }, 'Authentication email delivery failed');
    return { delivered: false };
  }
}