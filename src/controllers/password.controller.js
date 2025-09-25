import { passwordService } from '../services/password.service.js';
import { ResetTokenRepository } from '../repositories/resetToken.repository.js';

const resetRepo = new ResetTokenRepository();

/**
 * POST /api/password/forgot
 * En DEV se puede pedir que devuelva el token: ?dev=1 o body { "devolverToken": true }
 */
export const forgot = async (req, res) => {
  const { email, devolverToken } = req.body || {};
  const devFlag = req.query.dev === '1' || devolverToken === true || process.env.RETURN_RESET_TOKEN === 'true';

  const result = await passwordService.solicitarReset(email);
  // Siempre devolvemos OK para no filtrar si el mail existe
  if (devFlag && result?.token) {
    return res.json({
      status: 'ok',
      message: 'Mail de recuperación enviado',
      token: result.token,
      expira: result.expiresAt
    });
  }
  return res.json({ status: 'ok', message: 'Si el email existe, enviamos instrucciones' });
};

/**
 * POST /api/password/reset/:token
 */
export const reset = async (req, res) => {
  const { token } = req.params;
  const { nuevaContrasena } = req.body || {};
  if (!nuevaContrasena) {
    return res.status(400).json({ status: 'error', error: 'Coloque una contraseña que cumpla con lo requerido' });
  }
  await passwordService.reiniciarContrasena(token, nuevaContrasena);
  return res.json({ status: 'ok', message: 'Contraseña actualizada' });
};

/**
 * GET /api/password/debug/last-token?email=...
 * Solo para pruebas: devuelve el último token de ese email.
 */
export const ultimoToken = async (req, res) => {
  const { email } = req.query || {};
  if (!email) return res.status(400).json({ status: 'error', error: 'Falta email' });
  const doc = await resetRepo.obtenerUltimoPorEmail(email);
  if (!doc) return res.status(404).json({ status: 'error', error: 'No hay tokens para ese email' });
  return res.json({ status: 'ok', payload: { token: doc.token, expiresAt: doc.expiresAt } });
};
