import PasswordResetToken from '../../models/PasswordResetToken.js';

export class ResetTokenDAO {
  crear(data) {
    return PasswordResetToken.create(data);
  }

  obtenerPorToken(token) {
    return PasswordResetToken.findOne({ token, used: false }).lean();
  }

  obtenerUltimoPorEmail(email) {
    return PasswordResetToken.findOne({ email })
      .sort({ createdAt: -1 })
      .lean();
  }

  marcarUsado(token) {
    return PasswordResetToken.updateOne({ token }, { $set: { used: true } });
  }
}

// Exportamos **instancia** por defecto
export default new ResetTokenDAO();
