import { Router } from 'express';
import * as passwordController from '../controllers/password.controller.js';

const router = Router();

/**
 * POST /api/password/forgot
 * Genera token, guarda en BD y envía correo con botón.
 */
router.post('/forgot', passwordController.forgot);

/**
 * GET /api/password/reset/:token
 * Renderiza la página web por token (paginadereseteo.handlebars).
 * Esto es lo que abre el botón del correo.
 */
router.get('/reset/:token', (req, res) => {
  const { token } = req.params;
  // Render de la página con el token inyectado
  return res.render('auth/paginadereseteo', { token });
});

/**
 * POST /api/password/reset/:token
 * Consume el token y cambia la contraseña (valida expiración y anti-reuse).
 */
router.post('/reset/:token', passwordController.reset);

export default router;
