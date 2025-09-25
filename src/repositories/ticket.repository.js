import { DAOS } from '../daos/factory.js';
import { generarCodigoTicket } from '../utils/generadores.js';

export class TicketRepository {
  constructor() { this.dao = DAOS.ticketDAO; }

  async crear({ amount, purchaser, items, estado }) {
    const code = generarCodigoTicket();
    return this.dao.crear({ code, amount, purchaser, items, estado });
  }
}
