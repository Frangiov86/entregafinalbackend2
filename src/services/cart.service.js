import { CartRepository } from '../repositories/cart.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';

const cartRepo = new CartRepository();
const productRepo = new ProductRepository();

/** Helpers para soportar distintas formas de carrito */
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

/** Error tipado para stock insuficiente */
class StockInsuficienteError extends Error {
  constructor({ stock, enCarrito, intentandoAgregar }) {
    const disponible = Math.max(0, stock - enCarrito);
    super(
      `No hay stock suficiente. Stock: ${stock}. En tu carrito: ${enCarrito}. Intentaste agregar: ${intentandoAgregar}. Máximo que podés agregar ahora: ${disponible}.`
    );
    this.name = 'StockInsuficienteError';
    this.statusCode = 409; // conflicto de negocio
    this.status = 409;
    this.data = { stock, enCarrito, intentandoAgregar, disponibleParaAgregar: disponible };
  }
}

export const cartService = {
  async agregarProducto(cid, pid, cantidad = 1) {
    cantidad = Number.isFinite(+cantidad) ? Math.max(1, Math.floor(+cantidad)) : 1;

    const cart = await cartRepo.obtenerCarrito(cid);
    if (!cart) {
      const e = new Error('Carrito no encontrado');
      e.statusCode = 404; e.status = 404;
      throw e;
    }

    const producto = await productRepo.obtenerProducto(pid);
    if (!producto) {
      const e = new Error('Producto no encontrado');
      e.statusCode = 404; e.status = 404;
      throw e;
    }

    const stock = Number(producto.stock ?? 0);

    // cantidad actual de ese producto en el carrito
    const items = getItemsArray(cart);
    const existente = items.find(it => getItemProductIdStr(it) === pid);
    const enCarrito = existente ? getItemQty(existente) : 0;

    if (enCarrito + cantidad > stock) {
      throw new StockInsuficienteError({ stock, enCarrito, intentandoAgregar: cantidad });
    }

    // ok: agregamos
    await cartRepo.agregarItem(cid, pid, cantidad);
    // devolvemos carrito actualizado
    return await cartRepo.obtenerCarrito(cid);
  },

  async obtener(cid) {
    return cartRepo.obtenerCarrito(cid);
  },

  async vaciar(cid) {
    try {
      return await cartRepo.vaciar(cid);
    } catch {
      return await cartRepo.reemplazarItems(cid, []);
    }
  }
};
