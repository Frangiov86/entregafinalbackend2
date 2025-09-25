// DTO que filtra datos sensibles del usuario para /current
export class UsuarioCurrentDTO {
  constructor(usuario) {
    this.nombreCompleto = `${usuario.first_name ?? ''} ${usuario.last_name ?? ''}`.trim();
    this.email = usuario.email;
    this.rol = usuario.role ?? 'user';
    this.carritoId = usuario.cart?._id ?? usuario.cart ?? null;
  }
}
