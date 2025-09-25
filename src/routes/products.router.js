import { Router } from 'express';
import {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  borrarProducto
} from '../controllers/products.controller.js';

import { listarTodosLosProductos } from '../controllers/listarproductos.js';

import { passportCall } from '../middlewares/tokensvalidacion.js';
import { requireRole } from '../middlewares/rolesusuarios.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

// Públicos
router.get('/', asyncHandler(listarProductos));
router.get('/:id', asyncHandler(obtenerProducto));

// Solo admin
router.post('/', passportCall('current'), requireRole('admin'), asyncHandler(crearProducto));
router.put('/:id', passportCall('current'), requireRole('admin'), asyncHandler(actualizarProducto));
router.delete('/:id', passportCall('current'), requireRole('admin'), asyncHandler(borrarProducto));


// ✅ Endpoint admin-only para listar TODOS los productos sin paginado ni filtros
// GET /api/products/admin/all
router.get(
  '/admin/all',
  passportCall('current'),  // <- valida que haya sesión (JWT)
  requireRole('admin'),     // <- permite SOLO a rol 'admin'
  listarTodosLosProductos   // <- controller que responde con { status:'ok', payload:[...] }
);


export default router;
