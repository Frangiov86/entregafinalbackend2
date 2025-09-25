import { purchaseService } from '../services/purchase.service.js';

export const realizarCompra = async (req, res) => {
  const { cid } = req.params;
  const { email } = req.user; // ya viene de passport current
  const { ticket, pendientes } = await purchaseService.checkout(cid, email);
  res.status(201).json({ status: 'ok', payload: { ticket, pendientes } });
};
