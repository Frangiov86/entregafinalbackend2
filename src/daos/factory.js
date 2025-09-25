// Instanciá los DAOs (excepto resetToken que ya exporta instancia)
import UserDAO from './mongo/user.dao.js';
import ProductDAO from './mongo/product.dao.js';
import CartDAO from './mongo/cart.dao.js';
import TicketDAO from './mongo/ticket.dao.js';
import resetTokenDAOmongo from './mongo/resetToken.dao.js'; // instancia

export const DAOS = {
  userDAO:    new UserDAO(),
  productDAO: new ProductDAO(),
  cartDAO:    new CartDAO(),
  ticketDAO:  new TicketDAO(),
  resetTokenDAO: resetTokenDAOmongo
};
