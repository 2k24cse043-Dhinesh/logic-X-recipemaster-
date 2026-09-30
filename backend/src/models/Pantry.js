import mongoose from 'mongoose';

const pantrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: { type: [mongoose.Schema.Types.Mixed], default: [], validate: (items) => items.length <= 500 },
}, { timestamps: true });

const Pantry = mongoose.model('Pantry', pantrySchema);

export default Pantry;