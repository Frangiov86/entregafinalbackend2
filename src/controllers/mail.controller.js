import { transporter } from '../utils/mailer.js';

export const enviarMailPrueba = async (req, res) => {
  const { para, asunto = 'Prueba Nodemailer', cuerpo = 'Hola! Este es un correo de prueba 👋' } = req.body;

  if (!para) return res.status(400).json({ status: 'error', error: 'Falta destinatario (para)' });

  const info = await transporter.sendMail({
    to: para,
    from: process.env.MAIL_FROM,
    subject: asunto,
    text: cuerpo
  });

  res.json({ status: 'ok', message: 'Correo enviado', id: info.messageId });
};
