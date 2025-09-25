import { productoService } from '../services/product.service.js';

export const crearProducto = async (req, res) => {
  const prod = await productoService.crear(req.body);
  res.status(201).json({ status: 'ok', payload: prod });
};

export const listarProductos = async (req, res) => {
  const prods = await productoService.listar();
  res.json({ status: 'ok', payload: prods });
};

export const obtenerProducto = async (req, res) => {
  const p = await productoService.obtener(req.params.id);
  if (!p) return res.status(404).json({ status: 'error', error: 'No encontrado' });
  res.json({ status: 'ok', payload: p });
};

export const actualizarProducto = async (req, res) => {
  const p = await productoService.actualizar(req.params.id, req.body);
  if (!p) return res.status(404).json({ status: 'error', error: 'No encontrado' });
  res.json({ status: 'ok', payload: p });
};

export const borrarProducto = async (req, res) => {
  const p = await productoService.borrar(req.params.id);
  if (!p) return res.status(404).json({ status: 'error', error: 'No encontrado' });
  res.json({ status: 'ok', payload: 'Producto eliminado' });
};
