// Repository del carrito “tolerante” a diferentes nombres/firmas en el DAO.
// Evita errores del tipo: this.dao.obtenerCarrito is not a function

import { DAOS } from '../daos/factory.js';

const DBG = process.env.DEBUG_CART_REPO === 'true';

export class CartRepository {
  constructor() {
    this.dao = DAOS.cartDAO;
    if (!this.dao) {
      throw new Error('[CartRepository] DAOS.cartDAO es undefined. Revisá tu factory.js');
    }
    if (DBG) {
      // listado de métodos disponibles en tu DAO (debug opcional)
      try {
        console.log('[CartRepository] Métodos en cartDAO:', Object.keys(this.dao));
      } catch {}
    }
  }

  // -------- helpers internos --------
  #pick(names = []) {
    for (const n of names) {
      const f = this.dao?.[n];
      if (typeof f === 'function') return { name: n, fn: f.bind(this.dao) };
    }
    return null;
  }

  async #callWithIdOrFilter(fn, id) {
    // 1) intentar con el id directo
    try {
      const r1 = await fn(id);
      if (r1) return r1;
    } catch (e) {
      if (DBG) console.log('[CartRepository] call id -> error (intentamos con filtro):', e?.message);
    }
    // 2) intentar con filtro {_id:id}
    try {
      const r2 = await fn({ _id: id });
      if (r2) return r2;
    } catch (e2) {
      if (DBG) console.log('[CartRepository] call filtro -> error:', e2?.message);
    }
    return null;
  }

  async #ensureLean(res) {
    // Si viene un Query de Mongoose o doc completo, tratamos de lean()
    return res?.lean?.() ? res.lean() : res;
  }

  // -------- API pública --------

  async crearVacio() {
    const cand = this.#pick(['crear', 'create', 'crearCarrito', 'createCart']);
    if (!cand) throw new Error('CartDAO no expone método de creación (crear/create/crearCarrito/createCart)');
    const res = await cand.fn({ items: [] });
    return this.#ensureLean(res);
  }

  async obtenerCarrito(cartId) {
    // Nombres típicos para "obtener por id"
    const cand =
      this.#pick(['obtenerCarrito', 'obtenerPorId', 'getById', 'findByIdLean', 'findById']) ||
      this.#pick(['get', 'getOne', 'findOne', 'obtener', 'obtenerUno', 'getCartById', 'getCart']);
    if (!cand) {
      if (DBG) console.warn('[CartRepository] No encontré método de lectura por id en el DAO.');
      return null;
    }
    const res = await this.#callWithIdOrFilter(cand.fn, cartId);
    return this.#ensureLean(res);
  }

  async agregarItem(cartId, productId, cantidad) {
    // Intento 1: (cid, pid, cant)
    const cand =
      this.#pick(['agregarItem', 'addItem', 'agregarProducto', 'addProduct', 'pushItem', 'pushProducto']) ||
      this.#pick(['sumarItem', 'sumarProducto']);
    if (!cand) {
      throw new Error('CartDAO no expone método para agregar ítems (agregarItem/addItem/agregarProducto/...)');
    }

    try {
      const r = await cand.fn(cartId, productId, cantidad);
      return this.#ensureLean(r);
    } catch (e) {
      if (DBG) console.log(`[CartRepository] ${cand.name}(cid,pid,cant) falló:`, e?.message);
      // Intento 2: (cid, { productId, quantity })
      try {
        const payload = { productId, quantity: cantidad };
        const r2 = await cand.fn(cartId, payload);
        return this.#ensureLean(r2);
      } catch (e2) {
        if (DBG) console.log(`[CartRepository] ${cand.name}(cid,payload) también falló:`, e2?.message);
        throw e2;
      }
    }
  }

  async reemplazarItems(cartId, items) {
    // Reemplazo directo
    let cand = this.#pick(['reemplazarItems', 'setItems', 'replaceItems']);
    if (cand) {
      try {
        const r = await cand.fn(cartId, items);
        return this.#ensureLean(r);
      } catch (e) {
        if (DBG) console.log(`[CartRepository] ${cand.name}(cid,items) falló:`, e?.message);
      }
    }

    // Update genérico (id, data) o (filtro, data)
    cand = this.#pick(['actualizar', 'updateOne', 'update']);
    if (cand) {
      try {
        const r = await cand.fn(cartId, { items });
        return this.#ensureLean(r);
      } catch (e) {
        if (DBG) console.log(`[CartRepository] ${cand.name}(cid,{items}) falló, probamos con filtro:`, e?.message);
        try {
          const r2 = await cand.fn({ _id: cartId }, { items });
          return this.#ensureLean(r2);
        } catch (e2) {
          if (DBG) console.log(`[CartRepository] ${cand.name}({filtro},{items}) falló:`, e2?.message);
        }
      }
    }

    // Vaciar como último recurso si items === []
    if (Array.isArray(items) && items.length === 0) {
      return this.vaciar(cartId);
    }

    if (DBG) console.warn('[CartRepository] No pude reemplazar items: tu DAO no expone reemplazar/actualizar/vaciar.');
    return null;
  }

  async vaciar(cartId) {
    // Vaciar directo
    let cand = this.#pick(['vaciar', 'clear', 'empty']);
    if (cand) {
      const r = await cand.fn(cartId);
      return this.#ensureLean(r);
    }
    // Fallback: set items=[]
    return this.reemplazarItems(cartId, []);
  }
}
