import { DAOS } from '../daos/factory.js';

/**
 * Repository de Usuarios
 * - Envuelve al DAO y provee métodos claros.
 * - Si el DAO soporta proyección, la usa; si no, simplemente ignora el 2do parámetro.
 * - Devuelve lean() cuando está disponible.
 */
export class UserRepository {
  constructor() {
    this.dao = DAOS.userDAO;
  }

  listarUsuarios(filtro = {}, proyeccion = { password: 0, __v: 0 }) {
    // Llama a obtenerTodos con (filtro, proyeccion) si existe; si no, con (filtro) a secas
    const res =
      (this.dao.obtenerTodos?.length ?? 0) >= 2
        ? this.dao.obtenerTodos(filtro, proyeccion)
        : this.dao.obtenerTodos(filtro);

    // Si el DAO devuelve un Query de Mongoose, soporta .lean()
    return res?.lean?.() ?? res;
  }

  obtenerPorId(id, proyeccion = { password: 0, __v: 0 }) {
    const res =
      (this.dao.obtenerPorId?.length ?? 0) >= 2
        ? this.dao.obtenerPorId(id, proyeccion)
        : this.dao.obtenerPorId(id);

    return res?.lean?.() ?? res;
  }

  obtenerPorEmail(email, proyeccion = { password: 0, __v: 0 }) {
    const res =
      (this.dao.obtenerPorEmail?.length ?? 0) >= 2
        ? this.dao.obtenerPorEmail(email, proyeccion)
        : this.dao.obtenerPorEmail(email);

    return res?.lean?.() ?? res;
  }

  crear(datos) {
    return this.dao.crear(datos);
  }

  actualizar(id, datos) {
    const res = this.dao.actualizar(id, datos);
    return res?.lean?.() ?? res;
  }

  eliminar(id) {
    const res = this.dao.eliminar?.(id) ?? this.dao.borrar?.(id);
    return res?.lean?.() ?? res;
  }
}
