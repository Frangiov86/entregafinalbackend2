import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    // No usar index:true aquí para no duplicar el TTL
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// TTL: cuando expiresAt pasa, el doc se borra automáticamente
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 3er parámetro: nombre explícito de la colección
export default mongoose.model('PasswordResetToken', schema, 'passwordresettokens');
