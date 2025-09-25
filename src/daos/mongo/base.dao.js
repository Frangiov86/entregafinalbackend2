export default class BaseDAO {
  constructor(modelo) { this.modelo = modelo; }

  crear(data) {
    return this.modelo.create(data);
  }

  obtenerPorId(id) {
    return this.modelo.findById(id);
  }

  obtenerTodos(filtro = {}, proyeccion = null, opciones = {}) {
    return this.modelo.find(filtro, proyeccion, opciones);
  }

  actualizar(id, data) {
    return this.modelo.findByIdAndUpdate(id, data, { new: true });
  }

  borrar(id) {
    return this.modelo.findByIdAndDelete(id);
  }
}
