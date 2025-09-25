import { userService } from '../services/user.service.js';

/**
 * GET /api/users
 * Solo admin.
 * Devuelve lista segura (sin password) y en formato DTO liviano.
 */
export const listarUsuarios = async (req, res) => {
  const lista = await userService.listarTodos();

  // Filtro defensivo por si el DAO no aplicó proyección
  const safe = Array.isArray(lista) ? lista : [];
  const payload = safe.map((u) => {
    // normalizamos acceso a campos
    const id = u?._id?.toString?.() ?? u?.id ?? null;
    const first = u?.first_name ?? u?.firstName ?? '';
    const last = u?.last_name ?? u?.lastName ?? '';
    const email = u?.email ?? null;
    const rol = u?.role ?? 'user';
    const carritoId =
      u?.cart?._id?.toString?.() ??
      u?.cart?.toString?.() ??
      u?.cart ??
      null;
    const creado = u?.createdAt ?? null;

    return {
      id,
      nombreCompleto: `${first} ${last}`.trim(),
      email,
      rol,
      carritoId,
      creado
    };
  });

  res.json({ status: 'ok', total: payload.length, payload });
};
