import { ProductRepository } from '../repositories/product.repository.js';

const repo = new ProductRepository();

export const productoService = {
  crear: (data) => repo.crearProducto(data),
  listar: (filtro) => repo.listarProductos(filtro),
  obtener: (id) => repo.obtenerProducto(id),
  actualizar: (id, data) => repo.actualizarProducto(id, data),
  borrar: (id) => repo.borrarProducto(id)
};
