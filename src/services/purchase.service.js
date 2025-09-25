import { CartRepository } from '../repositories/cart.repository.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { TicketRepository } from '../repositories/ticket.repository.js';

const cartRepo = new CartRepository();
const prodRepo = new ProductRepository();
const ticketRepo = new TicketRepository();

export const purchaseService = {
  async checkout(cartId, purchaserEmail) {
    const cart = await cartRepo.obtenerCarrito(cartId);
    if (!cart) throw new Error('Carrito inexistente');

    const comprados = [];
    const pendientes = [];
    let total = 0;

    for (const item of (cart.items ?? [])) {
      const p = await prodRepo.obtener(item.productId);
      if (!p || !p.status) {
        pendientes.push({ productId: item.productId.toString(), titulo: p?.title ?? 'Producto no disponible', solicitado: item.quantity, stockDisponible: 0 });
        continue;
      }

      if (p.stock >= item.quantity) {
        // Descontar stock
        await prodRepo.actualizar(p._id, { stock: p.stock - item.quantity });
        const subtotal = p.price * item.quantity;
        total += subtotal;
        comprados.push({
          product: p._id,
          titulo: p.title,
          cantidad: item.quantity,
          precioUnitario: p.price,
          subtotal
        });
      } else {
        pendientes.push({
          productId: p._id.toString(),
          titulo: p.title,
          solicitado: item.quantity,
          stockDisponible: p.stock
        });
      }
    }

    const estado = pendientes.length ? 'PARCIAL' : 'COMPLETA';
    const ticket = await ticketRepo.crear({ amount: total, purchaser: purchaserEmail, items: comprados, estado });

    if (pendientes.length) {
      await cartRepo.reemplazarItems(cartId, pendientes.map(p => ({ productId: p.productId, quantity: p.solicitado })));
    } else {
      await cartRepo.vaciar(cartId);
    }

    return { ticket, pendientes };
  }
};
