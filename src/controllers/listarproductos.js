// src/controllers/listarproductos.js

// Importo el ProductRepository para respetar la arquitectura (Service/Repository/DAO)
import { ProductRepository } from '../repositories/product.repository.js';
// Importo el handler de errores async para evitar try/catch repetidos
import { asyncHandler } from '../middlewares/asyncHandler.js';
// Como fallback (por si tu repo no tiene "obtenerTodos"/"getAll"), importo el modelo directo
import Product from '../models/Product.js';

// Instancio el repositorio una sola vez (reutilizable)
const productRepo = new ProductRepository();

/**
 * Controller: listarTodosLosProductos
 * GET /api/products/admin/all
 * - Requiere rol ADMIN (lo valida el middleware en la ruta).
 * - Devuelve el listado COMPLETO de productos.
 */
export const listarTodosLosProductos = asyncHandler(async (req, res) => {
  // 1) Intento con los métodos típicos del repo (soporto varios nombres comunes)
  let productos =
    (productRepo.obtenerTodos && (await productRepo.obtenerTodos())) ||
    (productRepo.getAll && (await productRepo.getAll())) ||
    (productRepo.listar && (await productRepo.listar()));

  // 2) Si el repo no expone ninguno de esos, hago fallback directo al modelo Mongoose
  if (!productos) {
    productos = await Product.find({}).lean(); // .lean() para respuesta más liviana
  }

  // 3) Respondo normalizado
  return res.json({ status: 'ok', payload: productos });
});
