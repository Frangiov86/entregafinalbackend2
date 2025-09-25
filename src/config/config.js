import dotenv from 'dotenv';
dotenv.config();

// ---------- Servidor ----------
export const PORT = Number(process.env.PORT ?? 8080);
export const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/tu_db';

// ---------- Auth / Cookies ----------
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-jwt-secret';
export const SESSION_SECRET = process.env.SESSION_SECRET ?? 'dev-session-secret';

// Nombre de cookie con el JWT
export const COOKIE_NAME = process.env.COOKIE_NAME ?? 'accessToken';

// SAME_SITE puede ser: 'lax' | 'strict' | 'none'
export const SAME_SITE = process.env.SAME_SITE ?? 'lax';


export const COOKIE_SECURE = process.env.COOKIE_SECURE ?? 'false';

// Permitir registrarse como admin (solo dev/testing)
export const ALLOW_ADMIN_REGISTER = process.env.ALLOW_ADMIN_REGISTER ?? 'false';

// ---------- Mailing / Reset pass ----------
export const SMTP_HOST = process.env.SMTP_HOST ?? '';      // si usa Gmail se puede dejar vacío y usar host por defecto del mailer
export const SMTP_PORT = process.env.SMTP_PORT ?? '587';
export const SMTP_USER = process.env.SMTP_USER ?? process.env.MAIL_USER ?? '';
export const SMTP_PASS = process.env.SMTP_PASS ?? process.env.MAIL_PASS ?? '';
export const MAIL_FROM  = process.env.MAIL_FROM  ?? SMTP_USER;

// URL pública para armar el link del correo de reset
export const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? `http://localhost:${PORT}`;


export const RETURN_RESET_TOKEN = process.env.RETURN_RESET_TOKEN ?? 'false';
