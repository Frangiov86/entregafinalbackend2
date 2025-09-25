import { DAOS } from '../daos/factory.js';

/**
 * Repository de Productos
 * - Expone nombres "verbales" en español (crearProducto, obtenerProducto, etc.)
 * - Agrega alias genéricos (crear, obtener, listar, actualizar, eliminar)
 *   para no romper servicios que llamen con otros nombres.
 */
export class ProductRepository {
  constructor() {
    this.dao = DAOS.productDAO;
  }

  // ==== API principal (nombres "claros") ====
  crearProducto(data) {
    return this.dao.crear(data);
  }

  listarProductos(filtro = {}) {
    // Si el DAO ya retorna lean(), podés quitar .lean() acá
    return this.dao.obtenerTodos(filtro).lean?.() ?? this.dao.obtenerTodos(filtro);
  }

  obtenerProducto(id) {
    return this.dao.obtenerPorId(id).lean?.() ?? this.dao.obtenerPorId(id);
  }

  actualizarProducto(id, data) {
    return this.dao.actualizar(id, data).lean?.() ?? this.dao.actualizar(id, data);
  }

  borrarProducto(id) {
    // En tus DAOs el método es "borrar"; si fuera "eliminar", ajustá aquí
    return this.dao.borrar(id).lean?.() ?? this.dao.borrar(id);
  }

  // ==== ALIAS para compatibilidad (evitan "is not a function") ====
  crear(data) {               // alias de crearProducto
    return this.crearProducto(data);
  }

  listar(filtro = {}) {       // alias de listarProductos
    return this.listarProductos(filtro);
  }

  obtener(id) {               // alias de obtenerProducto
    return this.obtenerProducto(id);
  }

  actualizar(id, data) {      // alias de actualizarProducto
    return this.actualizarProducto(id, data);
  }

  eliminar(id) {              // alias de borrarProducto
    return this.borrarProducto(id);
  }
}
