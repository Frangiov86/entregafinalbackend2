import { Router } from 'express';
import {
  crearCarritoPropio,
  agregarAlCarrito,
  obtenerCarrito,
  obtenerCarritoDetallado,
  obtenerMiCarritoDetallado,
  vaciarMiCarrito,
  vaciarCarritoPorId
} from '../controllers/carts.controller.js';
import { passportCall } from '../middlewares/tokensvalidacion.js';
import { requireRole } from '../middlewares/rolesusuarios.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

//  '/mine' debe ir ANTES de '/:cid'
router.get(
  '/mine',
  passportCall('current'),
  requireRole('user'),
  asyncHandler(obtenerMiCarritoDetallado)
);

//  Crear/asegurar carrito del usuario actual
router.post(
  '/',
  passportCall('current'),
  requireRole('user'),
  asyncHandler(crearCarritoPropio)
);

// ✅ Vaciar MI carrito
router.delete(
  '/mine',
  passportCall('current'),
  requireRole('user'),
  asyncHandler(vaciarMiCarrito)
);

// Ver carrito por id (raw)
router.get('/:cid', asyncHandler(obtenerCarrito));

// Ver carrito por id con detalle
router.get('/:cid/details', asyncHandler(obtenerCarritoDetallado));

// ✅ Vaciar carrito por id (dueño o admin)
router.delete(
  '/:cid',
  passportCall('current'),
  asyncHandler(vaciarCarritoPorId)
);

// Agregar producto al carrito (solo user y solo su propio carrito)
router.post(
  '/:cid/products/:pid',
  passportCall('current'),
  requireRole('user'),
  asyncHandler(agregarAlCarrito)
);

export default router;
