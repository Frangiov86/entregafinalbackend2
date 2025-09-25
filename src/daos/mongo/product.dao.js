import BaseDAO from './base.dao.js';
import Product from '../../models/Product.js';

export default class ProductDAO extends BaseDAO {
  constructor() { super(Product); }
}
