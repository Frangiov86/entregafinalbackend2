import BaseDAO from './base.dao.js';
import Cart from '../../models/Cart.js';
import mongoose from 'mongoose';

export default class CartDAO extends BaseDAO {
  constructor() { super(Cart); }

  async agregarItem(cartId, productId, cantidad = 1) {
    const cId = new mongoose.Types.ObjectId(cartId);
    const pId = new mongoose.Types.ObjectId(productId);

    // Si existe el ítem, incrementa; si no, lo crea
    const cart = await this.modelo.findById(cId);
    if (!cart) throw new Error('Carrito inexistente');

    const idx = cart.items.findIndex(i => i.productId.toString() === pId.toString());
    if (idx >= 0) {
      cart.items[idx].quantity += cantidad;
    } else {
      cart.items.push({ productId: pId, quantity: cantidad });
    }
    await cart.save();
    return cart;
  }

  obtenerCarrito(id) {
    return this.modelo.findById(id).lean();
  }

  async reemplazarItems(cartId, items) {
    // items: [{ productId, quantity }]
    return this.modelo.findByIdAndUpdate(
      cartId,
      { $set: { items } },
      { new: true }
    ).lean();
  }

  async vaciar(cartId) {
    return this.modelo.findByIdAndUpdate(
      cartId,
      { $set: { items: [] } },
      { new: true }
    ).lean();
  }
}
