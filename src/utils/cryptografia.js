import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function crearHash(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function compararContraPlanoConHash(plaintext, hash) {
  if (!hash) return false;
  return bcrypt.compare(plaintext, hash);
}

  // Atajo para el router de sesiones

  export async function esValidaContrasena(usuario, passwordPlano) {
    return compararContraPlanoConHash(passwordPlano, usuario.password);


}
