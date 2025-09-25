import crypto from 'crypto';
import { UserRepository } from '../repositories/user.repository.js';
import { ResetTokenRepository } from '../repositories/resetToken.repository.js';
import { crearHash, esValidaContrasena } from '../utils/cryptografia.js';
import { enviarResetPassword } from '../utils/mailer.js'; // ahora exportado

const userRepo = new UserRepository();
const resetRepo = new ResetTokenRepository();

export const passwordService = {
  async solicitarReset(email) {
    // Buscamos usuario (traemos password para poder comparar luego)
    const user = await userRepo.obtenerPorEmail(email, { password: 1, email: 1 });
    // No revelamos si existe o no
    if (!user) {
      console.log(`[RESET] solicitud para email inexistente: ${email}`);
      return null;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await resetRepo.crear({ email, token, expiresAt });

    const base = process.env.PUBLIC_BASE_URL ?? 'http://localhost:8080';
    const link = `${base}/api/password/reset/${token}`;

    try {
      await enviarResetPassword(email, link); // botón azul
    } catch (e) {
      console.error('[MAIL] Fallo envío reset:', e.message);
    }

    // log de ayuda DEV
    console.log(`[RESET] email=${email} token=${token} expira=${expiresAt.toISOString()}`);

    return { token, expiresAt };
  },

  async reiniciarContrasena(token, nuevaContrasena) {
    const doc = await resetRepo.obtenerPorToken(token);
    if (!doc || doc.expiresAt < new Date() || doc.used) {
      const e = new Error('Token inválido o expirado');
      e.status = 400;
      throw e;
    }

    const user = await userRepo.obtenerPorEmail(doc.email, { password: 1 });
    if (!user) {
      await resetRepo.marcarUsado(token);
      const e = new Error('Usuario no encontrado');
      e.status = 404;
      throw e;
    }

    // No permitir reutilizar la misma contraseña
    const esMisma = await esValidaContrasena(user, nuevaContrasena);
    if (esMisma) {
      const e = new Error('La nueva contraseña no puede ser igual a la anterior');
      e.status = 409;
      throw e;
    }

    const hashed = await crearHash(nuevaContrasena);
    await userRepo.actualizar(user._id, { password: hashed });
    await resetRepo.marcarUsado(token);

    return true;
  }
};
