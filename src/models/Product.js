import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  category: { type: String, default: '' },
  status: { type: Boolean, default: true },
  thumbnails: { type: [String], default: [] }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
