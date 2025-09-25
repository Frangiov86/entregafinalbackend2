import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  MAIL_FROM
} from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Transport (SMTP genérico; por defecto Gmail)
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST || 'smtp.gmail.com',
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

export async function verificarSMTP() {
  try {
    await transporter.verify();
    console.log('[MAILER] Conexión SMTP OK');
  } catch (e) {
    console.error('[MAILER] Error SMTP:', e.message);
  }
}

// Envío genérico
export async function sendMail({ to, subject, html, attachments = [] }) {
  const from = MAIL_FROM || SMTP_USER;
  return transporter.sendMail({ from, to, subject, html, attachments });
}

// Fallback HTML del botón azul
function resetHtml(link) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
    <h2>Recuperación de contraseña</h2>
    <p>Hacé clic en el botón para restablecer tu contraseña. El enlace expira en 1 hora.</p>
    <p style="text-align:center;margin:24px 0">
      <a href="${link}" style="background:#0069d9;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">
        Restablecer contraseña
      </a>
    </p>
    <p>Si no solicitaste este cambio, ignorá este mensaje.</p>
  </div>`;
}

// Intenta usar handlebars si existe la plantilla, si no usa fallback
async function buildResetHtml(link) {
  try {
    const tplPath = path.join(__dirname, '..', 'views', 'mail', 'reset-password.hbs');
    const hbs = await fs.readFile(tplPath, 'utf8');
    // Reemplazo simple de {{link}} sin dependencias
    return hbs.replace(/{{\s*link\s*}}/g, link);
  } catch {
    return resetHtml(link);
  }
}

// 👉 Export principal usado por password.service
export async function enviarResetPassword(to, link) {
  const html = await buildResetHtml(link);
  return sendMail({
    to,
    subject: 'Restablecer contraseña',
    html
  });
}
