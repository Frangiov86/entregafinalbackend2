import { Router } from 'express';
import { listarUsuarios } from '../controllers/users.controller.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { crearHash } from '../utils/cryptografia.js';
import { passportCall } from '../middlewares/tokensvalidacion.js';
import { requireRole, requireSelfOrRole } from '../middlewares/rolesusuarios.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();





// Crear usuario (público para pruebas)
router.post('/', asyncHandler(async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;
  //  Importante: ignoramos 'role' y 'cart' enviados desde el cliente en esta ruta pública de prueba.
  //   El rol lo define el sistema (por defecto 'user') y el carrito lo creamos acá mismo.

  if (!first_name || !last_name || !email || !age || !password) {
    return res.status(400).json({ status: 'error', error: 'Faltan campos obligatorios' });
  }

  const existe = await User.findOne({ email });
  if (existe) return res.status(409).json({ status: 'error', error: 'Email ya registrado' });

  //  crear carrito vacío para que /current no devuelva carritoId:null
  const nuevoCarrito = await Cart.create({ items: [] });

  const nuevo = await User.create({
    first_name,
    last_name,
    email,
    age,
    password: await crearHash(password),
    // role: por defecto el del modelo (user). No permitimos escalar rol desde esta ruta pública.
    cart: nuevoCarrito._id
  });

  const plano = nuevo.toObject();
  delete plano.password;
  res.status(201).json({ status: 'ok', payload: plano });
}));

// Listado (solo admin)
router.get('/',
  passportCall('current'),
  requireRole('admin'),
  //  delegamos al controller para respetar la arquitectura (DTO / sin sensibles)
  asyncHandler(listarUsuarios)
);

// Obtener un usuario (propio o admin)
router.get('/:id',
  passportCall('current'),
  requireSelfOrRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    // ocultamos password por seguridad
    const usuario = await User.findById(id).select('-password').lean();
    if (!usuario) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
    res.json({ status: 'ok', payload: usuario });
  })
);

// Actualizar usuario (propio o admin)
router.put('/:id',
  passportCall('current'),
  requireSelfOrRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = { ...req.body };

    // si viene password, la hasheamos
    if (data.password) data.password = await crearHash(data.password);

    // Por seguridad, si esta ruta pudiera ser accedida por user,
    // no permitimos que actualice su "role" arbitrariamente.
    if (req.user?.role !== 'admin') {
      delete data.role;
      delete data.cart;
    }

    const actualizado = await User.findByIdAndUpdate(id, data, { new: true })
      .select('-password')
      .lean();
    if (!actualizado) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });

    res.json({ status: 'ok', payload: actualizado });
  })
);

// Borrar usuario (solo admin)
router.delete('/:id',
  passportCall('current'),
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const borrado = await User.findByIdAndDelete(id).lean();
    if (!borrado) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
    res.json({ status: 'ok', payload: 'Usuario eliminado' });
  })
);

export default router;
