import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, COOKIE_NAME, COOKIE_SECURE, SAME_SITE } from '../config/config.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { crearHash, esValidaContrasena } from '../utils/cryptografia.js';
import { passportCall } from '../middlewares/tokensvalidacion.js';
import { UsuarioCurrentDTO } from '../dtos/usuarioCurrent.dto.js';

const router = Router();

/**
 * Registro de usuario
 * - Valida campos
 * - Evita duplicados por email
 * - Hashea la contraseña
 * - ✅ Crea carrito vacío y lo asigna al usuario
 * - Respeta rol 'admin' solo si ALLOW_ADMIN_REGISTER=true (caso dev/testing)
 */
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;

    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ status: 'error', error: 'Faltan campos obligatorios' });
    }

    const existe = await User.findOne({ email });
    if (existe) return res.status(409).json({ status: 'error', error: 'Email ya registrado' });

    const hashed = await crearHash(password);

    // ✅ crear carrito vacío (estructura según tu modelo: aquí usamos 'items')
    const nuevoCarrito = await Cart.create({ items: [] });

    // permitir registrar admin solo si está habilitado por env
    const allowAdmin = process.env.ALLOW_ADMIN_REGISTER === 'true';
    const rolAsignado = (allowAdmin && role === 'admin') ? 'admin' : undefined;

    const usuario = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashed,
      role: rolAsignado,  // si no es admin permitido, queda undefined => default del modelo (user)
      cart: nuevoCarrito._id
    });

    const plano = usuario.toObject();
    delete plano.password;

    return res.status(201).json({ status: 'ok', payload: plano });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

/**
 * Login
 * - Valida credenciales
 * - Emite JWT con uid/email/role
 * - Setea cookie HTTPOnly (secure según .env convertido a booleano)
 * - Guarda un poco de info en sesión (connect-mongo) por conveniencia
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(401).json({ status: 'error', error: 'Usuario o contraseña incorrectos' });

    const ok = await esValidaContrasena(usuario, password);
    if (!ok) return res.status(401).json({ status: 'error', error: 'Usuario o contraseña incorrectos' });

    const token = jwt.sign(
      { uid: usuario._id, email: usuario.email, role: usuario.role },
      JWT_SECRET,
      { expiresIn: remember ? '30d' : '1d' }
    );

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: COOKIE_SECURE === 'true',   // <- booleano real
      sameSite: SAME_SITE,                // 'lax' | 'strict' | 'none'
      maxAge: remember ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24
    });

    // Persistencia de sesión (connect-mongo)
    req.session.uid = usuario._id.toString();
    req.session.role = usuario.role;
    req.session.email = usuario.email;

    return res.json({ status: 'ok', token });
  } catch (err) {
    return res.status(500).json({ status: 'error', error: err.message });
  }
});

/**
 * /current
 * - Usa strategy 'current' (passport) para validar JWT
 * - Devuelve DTO para no exponer datos sensibles
 * - Si la strategy lee el user desde DB por uid, siempre refleja rol/estado actual
 */
router.get('/current', passportCall('current'), (req, res) => {
  const dto = new UsuarioCurrentDTO(req.user);
  return res.json({ status: 'ok', payload: dto });
});

/**
 * /session (debug)
 */
router.get('/session', (req, res) => {
  return res.json({
    status: 'ok',
    payload: {
      uid: req.session?.uid || null,
      role: req.session?.role || null,
      email: req.session?.email || null
    }
  });
});

/**
 * Logout
 * - Limpia cookie y destruye sesión
 * - IMPORTANTE: secure como booleano real
 */
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: COOKIE_SECURE === 'true',   // <- booleano real también aquí
    sameSite: SAME_SITE
  });
  req.session?.destroy(() => {});
  return res.json({ status: 'ok', message: 'Sesión cerrada' });
});

export default router;
