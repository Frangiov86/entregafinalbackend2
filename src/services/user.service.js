import { UserRepository } from '../repositories/user.repository.js';

const repo = new UserRepository();

export const userService = {
  async listarTodos() {
    // Intentamos excluir password desde la consulta (si el DAO lo soporta)
    const usuarios = await repo.listarUsuarios({}, { password: 0, __v: 0 });
    return usuarios;
  },

  obtenerPorId: (id) => repo.obtenerPorId(id, { password: 0, __v: 0 }),
  obtenerPorEmail: (email) => repo.obtenerPorEmail(email, { password: 0, __v: 0 }),
  crear: (datos) => repo.crear(datos),
  actualizar: (id, datos) => repo.actualizar(id, datos),
  eliminar: (id) => repo.eliminar(id)
};
