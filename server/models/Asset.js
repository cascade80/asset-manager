import mongoose from 'mongoose';


const assetSchema = new mongoose.Schema({
  
  assetTag: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  category: { type: String, required: true },
  model: { type: String },
  serialNumber: { type: String },
  productKey: { type: String, default: '' },
  seats: { type: Number, default: null },
  expirationDate: { type: Date, default: null },
  
  
  purchasePrice: { type: Number, required: true },
  purchaseDate: { type: Date },
  supplier: { type: String },
  orderNumber: { type: String },
  warrantyMonths: { type: Number, default: 0 },
  
  
  status: { type: String, required: true, default: 'Available' },
  assignedTo: { type: String, default: 'Unassigned' },
  location: { type: String, default: 'Main IT Closet' },
  
  
  notes: { type: String }
}, { timestamps: true });


export default mongoose.model('Asset', assetSchema);