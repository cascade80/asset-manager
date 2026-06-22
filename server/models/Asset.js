import mongoose from 'mongoose';

// 1. Define the schema FIRST
const assetSchema = new mongoose.Schema({
  // Core Identification
  assetTag: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  category: { type: String, required: true },
  model: { type: String },
  serialNumber: { type: String },
  
  // Financial & Warranty Data
  purchasePrice: { type: Number, required: true },
  purchaseDate: { type: Date },
  supplier: { type: String },
  orderNumber: { type: String },
  warrantyMonths: { type: Number, default: 0 },
  
  // Status & Location
  status: { type: String, required: true, default: 'Available' },
  assignedTo: { type: String, default: 'Unassigned' },
  location: { type: String, default: 'Main IT Closet' },
  
  // Extra
  notes: { type: String }
}, { timestamps: true });

// 2. Export the model LAST using ES Modules syntax
export default mongoose.model('Asset', assetSchema);