import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Asset category is required'],
      enum: ['Hardware', 'Software', 'Furniture', 'Vehicle', 'Other'],
    },
    serialNumber: {
      type: String,
      unique: true,
      sparse: true,      
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: 'Available',
      enum: ['Available', 'In Use', 'Maintenance', 'Retired'],
    },
    assignedTo: {
      type: String,
      default: 'Unassigned',
      trim: true,
    }
  },
  {
    timestamps: true, 
  }
);

const Asset = mongoose.model('Asset', assetSchema);

export default Asset;