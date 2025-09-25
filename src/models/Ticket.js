import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  titulo: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 }
}, { _id: false });

const ticketSchema = new mongoose.Schema({
  code: { type: String, unique: true, index: true },
  purchase_datetime: { type: Date, default: Date.now },
  amount: { type: Number, required: true, min: 0 },
  purchaser: { type: String, required: true }, // email
  items: { type: [itemSchema], default: [] },
  estado: { type: String, enum: ['COMPLETA', 'PARCIAL'], default: 'COMPLETA' }
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);
