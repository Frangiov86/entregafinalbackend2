import { DAOS } from '../daos/factory.js';

export class ResetTokenRepository {
  constructor() {
    this.dao = DAOS.resetTokenDAO;
  }

  crear(data) {
    return this.dao.crear(data);
  }

  obtenerPorToken(token) {
    return this.dao.obtenerPorToken(token);
  }

  obtenerUltimoPorEmail(email) {
    return this.dao.obtenerUltimoPorEmail(email);
  }

  marcarUsado(token) {
    return this.dao.marcarUsado(token);
  }
}
