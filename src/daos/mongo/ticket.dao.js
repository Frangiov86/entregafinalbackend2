import BaseDAO from './base.dao.js';
import Ticket from '../../models/Ticket.js';

export default class TicketDAO extends BaseDAO {
  constructor() { super(Ticket); }
}
