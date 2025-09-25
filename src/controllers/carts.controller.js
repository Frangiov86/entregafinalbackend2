// Controladores del carrito
// - crearCarritoPropio: garantiza que el user tenga carrito, lo crea y asocia si falta
// - agregarAlCarrito: agrega producto (solo el dueño del carrito)
// - obtenerCarrito: devuelve el carrito por id (raw)
// - obtenerCarritoDetallado / obtenerMiCarritoDetallado: detalle con totales
// - vaciarMiCarrito: vacía el carrito del user actual
// - vaciarCarritoPorId: vacía un carrito por id (dueño o admin)

import { cartService } from '../services/cart.service.js';
import { CartRepository } from '../repositories/cart.repository.js';
import { UserRepository } from '../repositories/user.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';

const cartRepo = new CartRepository();
const userRepo = new UserRepository();
const productRepo = new ProductRepository();

function getItemsArray(cart) {
  if (!cart) return [];
  return Array.isArray(cart.items)
    ? cart.items
    : Array.isArray(cart.products)
      ? cart.products
      : [];
}
function getItemProductIdStr(item) {
  const raw =
    item.productId?._id ??
    item.productId ??
    item.product?._id ??
    item.product;
  return raw?.toString?.() ?? null;
}
function getItemQty(item) {
  return Number(item.quantity ?? item.cantidad ?? item.qty ?? 1);
}

async function buildCartDetails(cart) {
  const items = getItemsArray(cart);
  if (items.length === 0) {
    return { cartId: cart?._id?.toString?.() ?? null, items: [], totalCantidad: 0, totalAPagar: 0 };
  }

  const ids = Array.from(new Set(items.map(getItemProductIdStr).filter(Boolean)));
  const productos = await productRepo.listarProductos({ _id: { $in: ids } });
  const map = new Map(productos.map(p => [p._id.toString(), p]));

  const detalles = items.map(it => {
    const pid = getItemProductIdStr(it);
    const prod = pid ? map.get(pid) : null;
    const precio = Number(prod?.price ?? 0);
    const cantidad = getItemQty(it);
    return {
      productId: pid,
      titulo: prod?.title ?? '(eliminado)',
      categoria: prod?.category ?? null,
      precioUnitario: precio,
      cantidad,
      subtotal: precio * cantidad,
      stockDisponible: prod?.stock ?? null,
      thumbnail: prod?.thumbnail ?? null
    };
  });

  const totalCantidad = detalles.reduce((acc, d) => acc + d.cantidad, 0);
  const totalAPagar = detalles.reduce((acc, d) => acc + d.subtotal, 0);

  return {
    cartId: cart?._id?.toString?.() ?? null,
    items: detalles,
    totalCantidad,
    totalAPagar
  };
}

export const crearCarritoPropio = async (req, res) => {
  const uid = req.user._id?.toString?.() ?? req.user.id;
  const usuario = await userRepo.obtenerPorId(uid);
  if (!usuario) return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });

  if (usuario.cart) {
    const existente = await cartRepo.obtenerCarrito(usuario.cart);
    if (existente) {
      return res.json({ status: 'ok', payload: existente });
    }
    //  Referencia rota: crear uno nuevo y reasignar
    const nuevo = await cartRepo.crearVacio();
    await userRepo.actualizar(uid, { cart: nuevo._id });
    return res.status(201).json({ status: 'ok', payload: nuevo });
  }

  const nuevo = await cartRepo.crearVacio();
  await userRepo.actualizar(uid, { cart: nuevo._id });
  return res.status(201).json({ status: 'ok', payload: nuevo });
};

export const agregarAlCarrito = async (req, res) => {
  const { cid, pid } = req.params;
  const cantidad = Number(req.body?.cantidad ?? 1);

  const userCartId =
    req.user?.cart?._id?.toString?.() ??
    req.user?.cart?.toString?.() ??
    null;

  if (!userCartId || userCartId !== cid) {
    return res.status(403).json({
      status: 'error',
      error: 'No podés modificar carritos ajenos'
    });
  }

  try {
    const cart = await cartService.agregarProducto(cid, pid, cantidad);
    return res.status(201).json({ status: 'ok', payload: cart });
  } catch (err) {
    // respuesta amable cuando se supera el stock
    if (err?.name === 'StockInsuficienteError' || err?.status === 409 || err?.statusCode === 409) {
      return res.status(409).json({
        status: 'error',
        error: err.message,
        detalles: err.data ?? null
      });
    }
    // otros errores (404 carrito/producto, etc.)
    throw err;
  }
};

export const obtenerCarrito = async (req, res) => {
  const { cid } = req.params;
  const cart = await cartService.obtener(cid);
  if (!cart) {
    return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
  }
  return res.json({ status: 'ok', payload: cart });
};

export const obtenerCarritoDetallado = async (req, res) => {
  const { cid } = req.params;
  const cart = await cartService.obtener(cid);
  if (!cart) {
    return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
  }
  const detalles = await buildCartDetails(cart);
  return res.json({ status: 'ok', payload: detalles });
};

export const obtenerMiCarritoDetallado = async (req, res) => {
  const userCartId =
    req.user?.cart?._id?.toString?.() ??
    req.user?.cart?.toString?.() ??
    null;

  if (!userCartId) {
    return res.status(404).json({ status: 'error', error: 'El usuario no tiene carrito asignado' });
  }

  const cart = await cartService.obtener(userCartId);
  if (!cart) {
    return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
  }
  const detalles = await buildCartDetails(cart);
  return res.json({ status: 'ok', payload: detalles });
};

export const vaciarMiCarrito = async (req, res) => {
  const userCartId =
    req.user?.cart?._id?.toString?.() ??
    req.user?.cart?.toString?.() ??
    null;

  if (!userCartId) {
    return res.status(404).json({ status: 'error', error: 'El usuario no tiene carrito asignado' });
  }

  await cartService.vaciar(userCartId);
  return res.json({ status: 'ok', message: 'Carrito vaciado' });
};

export const vaciarCarritoPorId = async (req, res) => {
  const { cid } = req.params;

  const isAdmin = req.user?.role === 'admin';
  const userCartId =
    req.user?.cart?._id?.toString?.() ??
    req.user?.cart?.toString?.() ??
    null;
  const isOwner = userCartId === cid;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ status: 'error', error: 'No podés vaciar carritos ajenos' });
  }

  await cartService.vaciar(cid);
  return res.json({ status: 'ok', message: 'Carrito vaciado' });
};
