import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name : { type: String, required: true },
  email     : { type: String, required: true, unique: true, index: true },
  age       : { type: Number, required: true, min: 0 },
  password  : { type: String, required: true }, // hash
  cart      : { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', default: null },
  role      : { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
