import BaseDAO from './base.dao.js';
import User from '../../models/User.js';

export default class UserDAO extends BaseDAO {
  constructor() { super(User); }

  obtenerPorEmail(email) {
    return this.modelo.findOne({ email });
  }
}
