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
  
  
  purchasePrice: { type: Number, required: false , default : null },
  purchaseDate: { type: Date, default : null },
  supplier: { type: String, default : null },
  orderNumber: { type: String },
  warrantyMonths: { type: Date, default: null },
  
  
  status: { type: String, required: true, default: 'Available' },
  assignedTo: { type: String, default: 'Unassigned' },
  location: { type: String, default: 'Main IT Closet' },
  
  
  notes: { type: String }
}, { timestamps: true });


export default mongoose.model('Asset', assetSchema);