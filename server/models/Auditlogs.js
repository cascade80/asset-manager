import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'ASSIGN', 'UNASSIGN']
  },
  targetType: { 
    type: String, 
    default: 'Asset' 
  },
  assetTag: { 
    type: String, 
    required: true 
  },
  assetName: { 
    type: String, 
    required: true 
  },
  details: { 
    type: String, 
    required: true 
  },
  performedBy: { 
    type: String, 
    default: 'System Admin' 
  }
}, { 
  timestamps: true 
});

export default mongoose.model('AuditLog', auditLogSchema);